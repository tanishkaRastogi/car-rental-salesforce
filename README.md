# Car Rental – Salesforce (LWC + Apex)

A Salesforce application for managing a small car-rental business. Built with **Lightning Web Components (LWC)**, **Apex**, validation rules, and a trigger. It includes booking management, vehicle inventory, basic analytics, and role-based access patterns.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Metadata Included](#metadata-included)
- [Data Model](#data-model)
- [Business Rules](#business-rules)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Deploy to a Salesforce Org (SFDX)](#deploy-to-a-salesforce-org-sfdx)
  - [Post-Deployment Steps](#post-deployment-steps)
- [How to Use](#how-to-use)
- [Screenshots](#screenshots)
- [Known Issues & Notes](#known-issues--notes)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Create, search, and manage **Bookings**
- Track **Vehicles** and their availability
- Prevent double-booking of vehicles with an **overlap check**
- Auto-complete bookings whose end date has passed
- **Dashboard** (simple stats) from LWC
- Clean separation of concerns: LWC (UI) ⇄ Apex (server) ⇄ Data (Custom Objects)
- Sample validation rules for date sanity checks

---


## Architecture

LWC (bookingForm, bookingTable, bookingDashboard, bookingSearch)
↕ (Apex calls via @AuraEnabled)
Apex: BookingController.cls
↕
Salesforce Data: Booking__c, Vehicle__c (custom objects)
Validation Rules + Trigger: BookingTrigger (overlap prevention / updates)


---

## Metadata Included

- **Apex**
  - `classes/BookingController.cls`
- **LWC**
  - `lwc/bookingForm`
  - `lwc/bookingTable`
  - `lwc/bookingDashboard`
  - `lwc/bookingSearch`
- **Trigger**
  - `BookingTrigger` on `Booking__c` (prevents overlaps, allows status-only updates)
- **Validation Rules** (examples)
  - Start date not in past
  - End date after start date
  - Start/End not equal
  - Vehicle required

> Folder layout follows SFDX source format: `force-app/main/default/...`

---

## Data Model

**Booking__c**
- `Name`
- `Customer__c` (lookup to **User** in this sample)
- `Vehicle__c` (lookup to **Vehicle__c**)
- `Start_Date__c` (Date)
- `End_Date__c` (Date)
- `Status__c` (Picklist: `Active`, `Cancelled`, `Completed`)
- `Ignore_Validation__c` (Checkbox; used internally to bypass a date validation during automatic status updates)

**Vehicle__c**
- `Name`
- (extend as needed: model, plate, etc.)

---

## Business Rules

- **No Double Booking:**  
  Bookings for the same vehicle cannot overlap when the booking is **Active**. Updates that only change `Status__c` are allowed.
- **Automatic Completion:**  
  A small Apex job (invoked from UI) marks past bookings as `Completed` (and temporarily sets `Ignore_Validation__c = true` to avoid date validation errors).
- **Validation Rules:**  
  - Start date must be today or a future date  
  - End date must be after start date  
  - Start date must not equal end date  
  - Vehicle is required

---

## Setup

### Prerequisites
- Salesforce CLI (SFDX)
- A Salesforce org you can deploy to (Dev/DevHub/Sandbox)
- Git (optional, for cloning)

### Deploy to a Salesforce Org (SFDX)

```bash
# 1) Clone this repo
git clone https://github.com/tanishkaRastogi/car-rental-salesforce.git
cd car-rental-salesforce

# 2) Auth to your org (choose your login)
sfdx auth:web:login -a carRentalOrg

# 3) Deploy metadata
sfdx project deploy start -u carRentalOrg -p force-app

How to Use

Open App: App Launcher → Bookings.

Create Booking: Go to Booking Form → fill Name, Customer, Vehicle, Start Date, End Date → Submit.

Manage Bookings: Use the Bookings List table to cancel or review records.

Auto-Complete Past Bookings: When you open the page, outdated Active bookings are marked as Completed.

Known Issues & Notes

If a user can’t see customers/vehicles, check object permissions and Apex Class Access.

CRLF/LF warnings in Git are harmless—Windows vs. Unix line endings.

In demo, Customer points to User for simplicity. In production, you may want a Customer__c object.
