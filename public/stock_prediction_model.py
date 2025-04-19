import matplotlib
matplotlib.use('Agg')  # Set the backend to non-interactive
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import datetime
from keras.models import Sequential
from keras.optimizers import Adam
from keras import layers
import os
import pickle

# Rest of your code...

# Load dataset
for dirname, _, filenames in os.walk('new_york_stock_exchange'):
    for filename in filenames:
        print(os.path.join(dirname, filename))

# Assuming the dataset is loaded into df
df = pd.read_csv('new_york_stock_exchange/prices-split-adjusted.csv')

def str_to_datetime(s):
    split = s.split('-')
    year, month, day = int(split[0]), int(split[1]), int(split[2])
    return datetime.datetime(year=year, month=month, day=day)

def df_to_windowed_df(dataframe, n=20, f=5):
    first_date = dataframe.index[n + f]
    last_date = dataframe.index[-f]
    
    first_date_str = str(dataframe[dataframe.index == first_date].index[0]).split(" ")[0]
    last_date_str = str(dataframe[dataframe.index == last_date].index[0]).split(" ")[0]

    target_date = first_date
    dates = []
    X, Y = [], []

    last_time = False
    while True:
        df_subset = dataframe.loc[:target_date].tail(n + f)
        if len(df_subset) != n + f:
            print(f'Error: Window of size {n + f} is too large for date {target_date}')
            return

        values = df_subset['close'].to_numpy()
        x, y = values[:-f], values[-f:]

        dates.append(target_date)
        X.append(x)
        Y.append(y)

        next_week = dataframe.loc[target_date:target_date + datetime.timedelta(days=7)]
        next_datetime_str = str(next_week.head(2).tail(1).index.values[0])
        next_date_str = next_datetime_str.split('T')[0]
        year, month, day = map(int, next_date_str.split('-'))
        next_date = datetime.datetime(year=year, month=month, day=day)

        if last_time:
            break

        target_date = next_date

        if target_date == last_date:
            last_time = True

    ret_df = pd.DataFrame({})
    ret_df['Target Date'] = dates

    X = np.array(X)
    Y = np.array(Y)
    
    for i in range(0, n):
        ret_df[f'Target-{n - i}'] = X[:, i]

    for i in range(0, f):
        ret_df[f'Target+{i}'] = Y[:, i]

    return ret_df

def windowed_df_to_date_X_y(windowed_dataframe, n=20, f=5):
    df_as_np = windowed_dataframe.to_numpy()
    dates = df_as_np[:, 0]

    middle_matrix = df_as_np[:, 1:-f]
    X = middle_matrix.reshape((len(dates), middle_matrix.shape[1], 1))

    Y = df_as_np[:, -f:]

    return dates, X.astype(np.float32), Y.astype(np.float32)

df = df.dropna(how="any")
df = df[['date', 'symbol', 'close']]
df['date'] = df['date'].apply(str_to_datetime)
df.index = df.pop('date')

# Check if the processed data exists
processed_data_path = 'processed_windowed_data.pkl'

if not os.path.exists(processed_data_path):
    # Process the data and save it
    windowed_df = pd.concat([df_to_windowed_df(df[df["symbol"] == x][:-25]) for x in np.unique(df.symbol)], axis=0)
    with open(processed_data_path, 'wb') as f:
        pickle.dump(windowed_df, f)
else:
    # Load the processed data
    with open(processed_data_path, 'rb') as f:
        windowed_df = pickle.load(f)

# Prepare data for training
dates, X, y = windowed_df_to_date_X_y(windowed_df) 

# Simple LSTM model as a reference
model = Sequential([
    layers.Input((20, 1)),
    layers.LSTM(64),
    layers.Dense(16, activation='relu'),
    layers.Dropout(0.1),
    layers.Dense(5)
])

model.compile(loss='mse', optimizer=Adam(learning_rate=0.0005), metrics=['mean_absolute_error'])

forward_layer = layers.LSTM(32, return_sequences=True)
backward_layer = layers.LSTM(32, activation='relu', return_sequences=True, go_backwards=True)

# BI-directional stacked LSTM model with merge_mode= "concat"
model_bi_stacked_concat = Sequential([
    layers.Input(shape=(20, 1)),
    layers.Bidirectional(forward_layer, backward_layer=backward_layer, merge_mode='concat'),
    layers.LSTM(32, return_sequences=True),
    layers.LSTM(32),
    layers.Dense(16, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(5)
])

model_bi_stacked_concat.compile(loss='mse', optimizer=Adam(learning_rate=0.0005), metrics=['mean_absolute_error'])

# Check if model weights exist
model_weights_path = "lstm_model.weights.h5"
bi_stacked_concat_weights_path = "bi_stacked_concat_model.weights.h5"

if not os.path.exists(model_weights_path) or not os.path.exists(bi_stacked_concat_weights_path):
    # Train the models
    model.fit(X, y, epochs=10, batch_size=128, validation_split=0.2)
    model.save_weights(model_weights_path, overwrite=True)

    model_bi_stacked_concat.fit(X, y, epochs=10, batch_size=128, validation_split=0.2)
    model_bi_stacked_concat.save_weights(bi_stacked_concat_weights_path, overwrite=True)
else:
    # Load the model weights
    model.load_weights(model_weights_path)
    model_bi_stacked_concat.load_weights(bi_stacked_concat_weights_path)

# Function to plot predictions for a specific stock symbol
def plot_stock_predictions(symbol, n=20, f=5, save_path='predicted_stock_graph.png'):
    # Create windowed dataframe for the specified stock symbol
    windowed_df = df_to_windowed_df(df[df["symbol"] == symbol], n=n, f=f)
    dates_val, X_val, y_val = windowed_df_to_date_X_y(windowed_df, n=n, f=f)
    
    # Make predictions using both models
    val_predictions_concat = model_bi_stacked_concat.predict(X_val)
    val_predictions = model.predict(X_val)

    # Plot actual observations
    plt.plot(dates_val[-50:], np.append(y_val[-46:-1, 0], y_val[-1]))
    # Plot bi-directional stacked LSTM model predictions
    plt.plot(dates_val[-6:], np.append(X_val[-1:, -1][0], val_predictions_concat[-5:][0]))
    # Plot simple LSTM model predictions
    plt.plot(dates_val[-6:], np.append(X_val[-1:, -1][0], val_predictions[-5:][0]))

    # Add title and legend
    plt.title(f'Predictions for {symbol}')
    plt.legend(['Test Observations', 'Test bi_stacked_concat Predictions', 'Test one-lstm Predictions'])
    
    # Save the plot as an image file
    plt.savefig(save_path)
    
    # Clear the plot to release memory
    plt.clf()  # Clear the current figure

    # Optionally, you can return the save_path if you need it for further processing
    return save_path


# Example usage:
#plot_stock_predictions('EBAY')  # Replace 'AAPL' with any stock symbol you want to predict
