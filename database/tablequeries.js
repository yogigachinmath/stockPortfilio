const tableQuery = `CREATE TABLE Transactions
(
 TransactionId    serial NOT NULL,
 TransactionDate  date NOT NULL,
 Ticker           varchar(10) NULL,
 Action           varchar(50) NOT NULL,
 Quantity         int NULL,
 PriceOfEachShare decimal NULL,
 Amount           decimal NULL,
 CONSTRAINT PK_transactions PRIMARY KEY ( TransactionId )
);

CREATE TABLE Portfolio
(
 Ticker        varchar(10) NOT NULL,
 portfolioid   serial NOT NULL,
 Quantity      int NOT NULL,
 TransactionId integer NOT NULL,
 CONSTRAINT PK_portfolio PRIMARY KEY ( portfolioid ),
 CONSTRAINT FK_28 FOREIGN KEY ( TransactionId ) REFERENCES Transactions ( TransactionId )
);

CREATE INDEX fkIdx_29 ON Portfolio
(
 TransactionId
);


CREATE TABLE BalanceSheet
(
 BalanceSheetid serial NOT NULL,
 AccountBalance decimal NOT NULL,
 TransactionId  int NOT NULL,
 CONSTRAINT PK_balancesheet PRIMARY KEY ( BalanceSheetid ),
 CONSTRAINT FK_25 FOREIGN KEY ( TransactionId ) REFERENCES Transactions ( TransactionId )
);

CREATE INDEX fkIdx_26 ON BalanceSheet
(
 TransactionId
);
`;

module.exports = tableQuery;
