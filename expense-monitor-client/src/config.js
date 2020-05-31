export default {
    dataService : {
        getExpenses : '/api/getExpenses',
        saveExpenseWithSort : '/api/saveExpenseWithSort'
    },
    currencyAPI : {
        exchangeratesapiURI : 'https://api.exchangeratesapi.io/latest'
        //openexchangeratesURI : 'https://openexchangerates.org/api/latest.json'
    },
    monthsFinal: ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsMap : {'January' : 1, 'February' : 2, 'March' : 3, 'April' : 4, 'May' : 5, 'June' : 6, 'July' : 7, 'August' : 8, 'September' : 9, 'October' :10, 'November' : 11, 'December' : 12},
    yearsFinal: [2018, 2019, 2020, 2021, 2022, 2023],
    paymentType : ['Credit Card', 'Bank', 'Debit Card'],
    expenseCategory : ['Transportation', 'Home','Utilities','Health','Entertainment','Dining','Credit Card','Miscellaneous','Other'],
    expenseSubCategories : {'Transportation' : ['Auto Loan/Lease','Insurance ','Gas','Maintenance'], 'Home' : ['Mortgage','Rent','Maintenance','Insurance','Furniture','Groceries','Tax','Electricity','Deposit','Kitchen Utensils'],'Utilities' : ['Phone','Mobile','Cable','Gas','Water','Electricity','Internet','Other'],'Health' : ['Dental','Medical','Medication','Vision/contacts','Life Insurance','Other'],'Entertainment' : ['Events','Subscriptions','Movies','Music','Hobbies','Travel/Vacation','Personal','Other'],'Dining' : ['Other'],'Credit Card' : ['Discover','Amex'],'Miscellaneous' : ['401k','IRA','Donations','New Clothes','Gifts','Haircut'], 'Other' : []},
    subCategories : ['Auto Loan/Lease','Insurance ','Gas','Maintenance','Mortgage','Rent','Maintenance','Furniture','Groceries','Tax','Electricity','Phone','Mobile','Cable','Gas','Water','Internet','Dental','Medical','Medication','Vision/contacts','Life Insurance','Events','Subscriptions','Movies','Music','Hobbies','Travel/Vacation','Personal','Discover','Amex','401k','IRA','Donations','New Clothes','Gifts','Haircut','Deposit','Other','Kitchen Utensils'],
    currency : ['USD','INR','CAD'],
    incomeType : ['Work', 'Other'],
    expenseDefaults : {
        defaultPaymentType : 'Credit Card',
        defaultExpenseCategory : 'Dining',
        defaultAmount : 0,
        defaultCurrency : 'USD',
        defaultMonth : 'All',
        logType : 'Expense',
        incomeType : 'Work'
    }
}