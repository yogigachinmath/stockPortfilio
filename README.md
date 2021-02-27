prerequisites:
node,
postgresql,


Instructions:

1.Git clone https://github.com/yogigachinmath/stockPortfilio.git 
   cd stockPortfolio
   'npm install' to install the npm packages.

2.Setup the database In the config folder, config file Add the database details. 

3.Start the Postgres db local server and create the database manually provide the database name given in the config.

4.The tables are created automatically.

5.here are the routes available. 
   
   1. To get the Quote of the ticker.
        
            GET '/quote/:tinker'
            params = { ticker }
   
   2. To get the portfolio of the user.
        
            GET '/portfolio' 
   
   3. To get the history of the transactions
        
            GET '/history'
   
   4. To buy a Share 
        
            POST  '/transaction'
        
            body {
        
            type ['buy', 'sell'],
        
            quantity[int],
        
            ticker[tickersymbol],
            
            }
   
   5. to add money to your account
        
            POST '/transfer'
        
            body {
        
            type[add, remove],
        
            amount[float],
        
            }
