# Firebase Realtime Database Rules for Centralized Finance Using Stablecoins Token

This README.md file provides an overview of the Firebase Realtime Database rules for a Centralized Finance (CeFi) platform that uses Stablecoins Token. These rules define who can read and write data within the database, as well as the validation criteria for specific operations.

## Table of Contents

1.  Overview
2.  Database Structure
3.  Rules Overview
4.  Detailed Rules
5.  Admin Access
6.  Public Settings
7.  Historic Data

## Overview

The Firebase Realtime Database is used to manage financial data for a CeFi platform. It enforces strict rules to ensure the security and integrity of user data and financial transactions. Below, you'll find an overview of the database structure and the key rules governing data access and validation.

## Database Structure

The database is organized into various sections:

-   **accounts**: Contains user accounts with different levels of access.
-   **online** and **refresh**: Sections for online and refresh status of users.
-   **requests**: Various user requests like creating usernames, editing profile details, and performing financial actions.
-   **serialNumberPrepaidCards**: Stores serial numbers for prepaid cards.
-   **usernames**: Stores usernames for users.
-   **admin** and **adminRequests**: Sections for administrative access and requests.
-   **publicSettings**: Public settings that can be read by anyone.
-   **historic**: Stores historic data, including transactions and prepaid card details.
-   **trcWalletUsers**, **bscWalletUsers**, and **ethWalletUsers**: Sections for different wallet types.
-   **uidusername**: Stores user IDs and usernames.

## Rules Overview

Here's a high-level overview of the database rules:

-   Only an authenticated user with a specific UID is allowed to read and write data (e.g., `auth.uid === 'XXXXXXXXXXXXXXXXXXXXXXXXXXXX'`).
    
-   Users have different levels of access to their own accounts (e.g., "readable," "editable," "public," and "verified").
    
-   Various user requests like creating usernames and performing financial actions are controlled and validated based on specific conditions.
    
-   Administrative access is restricted to specific UIDs (`auth.uid === 'XXXXXXXXXXXXXXXXXXXXXXXXXXXX' || auth.uid === 'XXXXXXXXXXXXXXXXXXXXXXXXXXXX'`).
    
-   Some data is publicly readable (`publicSettings`), while others are only accessible to authenticated users.
    

## Detailed Rules

For detailed rules related to user accounts, requests, and other specific operations, please refer to the actual database rules provided in the original code.

## Admin Access

The database includes rules for administrative access, allowing designated admin users to perform specific actions and updates. Admin access is carefully controlled to maintain security.

## Public Settings

Certain data within the database is designated as public settings and can be read by anyone. These settings may include information that is not sensitive or confidential.

## Historic Data

Historic data, such as transaction records and prepaid card details, is maintained in the database for historical reference. Access to historic data is restricted to authenticated users.

Please note that the above is a high-level overview, and the actual rules and conditions can be found in the provided code.

For any further information or questions regarding the database rules, please refer to the developer or administrator responsible for managing the Firebase Realtime Database for this CeFi platform.
