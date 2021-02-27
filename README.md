prerequisites:
node,
postgresql,

Unzip the package and follow the below steps.

Instructions:

1.First Install the npm packages by 'npm install'

2.Setup the database In the config folder, config file Add the database details. 

3.Start the Postgres db local server and create the database manually.

4.The tables are created automatically.

5.here are the routes available. 
    1. To get the Quote of the ticker.
        GET '/quote/:tinker', params = { ticker };
    2. To get the portfolio of the user.
        GET '/portfolio' 
    3. To get the history of the transactions
        GET '/history'
    4. To buy a Share 
        POST  http://localhost:5000/transaction
        body {
            type ['buy', 'sell'],
            quantity[int],
            ticker[tickersymbol],
        }
    5. to add money to your account
        POST  http://localhost:5000/transfer
        body {
            type[add, remove],
            amount[float],
        }