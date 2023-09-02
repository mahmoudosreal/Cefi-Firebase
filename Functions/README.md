# Firebase Functions for Centralized Finance Using Stablecoins Token

## Functionality

This Firebase Functions codebase serves as the backend for a centralized finance application. It includes a variety of functions triggered by events such as database writes, user authentication, and scheduled tasks. Below is a brief explanation of the major functionalities implemented in this codebase:

### User Management

1. `onCreateAccount`: Triggered when a new user account is created. This function handles user account creation.

2. `onDeleteAccount`: Triggered when a user account is deleted. This function handles user account deletion.

3. `onRequestCreateUserName`, `onRequestEditBlurb`, `onRequestEditPhoneNumber`, `onRequestEditDisplayName`, `onRequestEditFullName`, `onRequestEditAddress`, `onRequestEditCity`, `onRequestEditCountry`: These functions handle user profile update requests.

4. `onUpdateUserPublic`: Triggered when user profile information is updated. This function handles the update of user public profile data.

5. `onUpdateUserBusy`: Triggered when a user's busy status changes. This function handles updates to the user's availability status.

### Financial Transactions

6. `onRequestRechargePrepaidCard`: Triggered when a user requests to recharge a prepaid card.

7. `onSystemRechargePrepaidCard`: Handles the system-level recharge of prepaid cards.

8. `onRequestTransferUSDT`: Triggered when a user requests a USDT (Tether) transfer.

9. `onRequestGeneratePrepaidCard`, `onSystemGeneratePrepaidCard`, `onSystemProcessingGeneratePrepaidCard`: Handle prepaid card generation requests and processing.

10. `checkupWalletActions`, `onCreateAuxWalletActions`: Manages wallet actions and updates to user balances.

11. `onUpdateUserBalance`: Triggered when user balances are updated.

12. `onAdminRequestGenerate100USDT`, `onAdminRequestUnblockBlock`, `onAdminRequestBlockBlock`, `onAdminRequestDeleteBlock`: Functions to handle admin requests for various actions.

### Withdrawals and Deposits

13. `onRequestWithdrawTronUSDT`: Triggered when a user requests a withdrawal of USDT to the Tron network.

14. `checkupSystemWithdrawTronRequests`, `onSystemWithdrawTronProcess`, `onSystemTronWithdrawTransactions`, `checkupSystemTronWithdrawBuffer`, `onSystemTronWithdrawFinish`: Manage Tron network withdrawals.

15. `checkupUsdtWithdrawTrcCentralWallets`, `checkupTronDepositSignals`, `checkupSystemTrxDepositRequests`, `onSystemTrxDepositsProcess`, `checkupSystemTrxDepositsProcess`, `onSystemTronDepositRequests`, `onSystemTronDepositTransactions`, `checkupSystemTronDepositBuffer`, `onSystemTronDepositFinish`: Handle Tron network deposits and related processes.

16. `onRequestWithdrawBinanceUSDT`, `checkupSystemWithdrawBinanceRequests`, `onSystemWithdrawBinanceProcess`, `onSystemBinanceWithdrawTransactions`, `checkupSystemBinanceWithdrawBuffer`, `onSystemBinanceWithdrawFinish`: Manage Binance network withdrawals and related processes.

17. `onRequestWithdrawEthereumUSDT`, `checkupSystemWithdrawEthereumRequests`, `onSystemWithdrawEthereumProcess`, `onSystemEthereumWithdrawTransactions`, `checkupSystemEthereumWithdrawBuffer`, `onSystemEthereumWithdrawFinish`: Manage Ethereum network withdrawals and related processes.

### Payment Cards and Invoices

18. `onRequestRequestMerchantApiKey`, `onRequestRevokeMerchantApiKey`: Handle requests for merchant API keys.

19. `onRequestRequestPaymentCard`, `onRequestRevokePaymentCard`, `onRequestChangePaymentCard`, `onRequestTopupPaymentCardWallet`, `onRequestRedeemPaymentCard`, `onRequestTransferToDepositCard`: Manage various payment card-related requests.

20. `onCreateRequestedInvoices`: Triggered when invoices are created.

21. `onDeleteActiveOrdersApiKey`: Handles the deletion of active orders associated with API keys.

22. `onCreatePaymentPaymentCardRequest`: Triggered when a payment card payment request is created.

### Scheduled Tasks

23. `checkupEverything`, `checkupOnline`, `deleteAuxs`, `checkupGasPrice`: These functions are scheduled to run at specific intervals to perform system maintenance and checks.

## Getting Started

To set up and deploy this Firebase Functions code, follow these steps:

1. Clone this repository.

2. Install Firebase CLI if you haven't already: `npm install -g firebase-tools`.

3. Log in to your Firebase account: `firebase login`.

4. Initialize Firebase for your project: `firebase init`.

5. Deploy the functions to Firebase: `firebase deploy --only functions`.

6. Configure Firebase Realtime Database, Firestore, and other Firebase services as needed for your application.

7. Implement frontend and other components of your application that interact with these Firebase Functions.

8. Test the application thoroughly to ensure that all functionalities work as expected.

## Disclaimer

This codebase serves as a template for a centralized finance application and requires further customization, security reviews, and thorough testing before deployment in a production environment. Ensure that sensitive information and access controls are properly implemented to protect user data and financial transactions.

Please refer to the Firebase documentation and other relevant documentation for more details on configuring Firebase services and securing your application.
