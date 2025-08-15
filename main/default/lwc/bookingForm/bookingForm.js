import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getCustomerOptions from '@salesforce/apex/BookingController.getCustomerOptions';
import getVehicleOptions from '@salesforce/apex/BookingController.getVehicleOptions';
import saveBooking from '@salesforce/apex/BookingController.saveBooking';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookingForm extends NavigationMixin(LightningElement) {
    @track customerOptions = [];
    @track vehicleOptions = [];

    bookingName;
    selectedCustomer;
    selectedVehicle;
    startDate;
    endDate;

    @wire(getCustomerOptions)
    wiredCustomerOptions({ error, data }) {
        if (data) {
            this.customerOptions = data.map(cust => ({
                label: cust.Name, value: cust.Id
            }));
        } else if (error) {
            this.showToast('Error loading customers', error.body?.message || 'Unknown error', 'error');
        }
    }

    @wire(getVehicleOptions)
    wiredVehicleOptions({ error, data }) {
        if (data) {
            this.vehicleOptions = data.map(veh => ({
                label: veh.Name, value: veh.Id
            }));
        } else if (error) {
            this.showToast('Error loading vehicles', error.body?.message || 'Unknown error', 'error');
        }
    }

    handleBookingNameChange(event) {
        this.bookingName = event.detail.value;
    }

    handleCustomerChange(event) {
        this.selectedCustomer = event.detail.value;
    }

    handleVehicleChange(event) {
        this.selectedVehicle = event.detail.value;
    }

    handleStartDateChange(event) {
        this.startDate = event.detail.value;
    }

    handleEndDateChange(event) {
        this.endDate = event.detail.value;
    }

    handleSubmit() {
        if (!this.bookingName || !this.selectedCustomer || !this.selectedVehicle || !this.startDate || !this.endDate) {
            this.showToast('Missing Fields', 'Please fill in all fields before submitting.', 'warning');
            return;
        }

        saveBooking({
            bookingName: this.bookingName,
            customerId: this.selectedCustomer,
            vehicleId: this.selectedVehicle,
            startDate: this.startDate,
            endDate: this.endDate
        })
        .then(() => {
            this.showToast('Success', 'Booking created successfully!', 'success');
            this.resetForm();
            this.navigateToBookingList();
        })
        .catch(error => {
            console.error('Error:', error);
            let errorMessage = 'Booking failed. Please correct the following:\n';

            if (error.body?.fieldErrors) {
                for (const field in error.body.fieldErrors) {
                    error.body.fieldErrors[field].forEach(err => {
                        errorMessage += `• ${err.message}\n`;
                    });
                }
            }

            if (error.body?.pageErrors) {
                error.body.pageErrors.forEach(err => {
                    errorMessage += `• ${err.message}\n`;
                });
            }

            this.showToast('Validation Error', errorMessage.trim(), 'error');
        });
    }

    navigateToBookingList() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Booking__c',
                actionName: 'list'
            },
            state: {
                filterName: 'All'
            }
        });
    }

    resetForm() {
        this.bookingName = '';
        this.selectedCustomer = '';
        this.selectedVehicle = '';
        this.startDate = '';
        this.endDate = '';
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}