import { LightningElement, track, api } from 'lwc';
import getAllBookings from '@salesforce/apex/BookingController.getAllBookings';
import cancelBooking from '@salesforce/apex/BookingController.cancelBooking';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateOutdatedBookings from '@salesforce/apex/BookingController.updateOutdatedBookings';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Customer', fieldName: 'CustomerName' },
    { label: 'Vehicle', fieldName: 'VehicleName' },
    { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date' },
    { label: 'End Date', fieldName: 'End_Date__c', type: 'date' },
    { label: 'Status', fieldName: 'Status__c' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [{ label: 'Cancel', name: 'cancel' }]
        }
    }
];

export default class BookingTable extends LightningElement {
    @track bookings = [];
    columns = COLUMNS;

    @api
    loadBookings() {
        getAllBookings()
            .then(data => {
                if (data && Array.isArray(data)) {
                    this.bookings = data.map(booking => {
                        let customerName = '-';
                        let vehicleName = '-';

                        if (booking.Customer__r && booking.Customer__r.Name) {
                            customerName = booking.Customer__r.Name;
                        }

                        if (booking.Vehicle__r && booking.Vehicle__r.Name) {
                            vehicleName = booking.Vehicle__r.Name;
                        }

                        return {
                            Id: booking.Id,
                            Name: booking.Name,
                            Start_Date__c: booking.Start_Date__c,
                            End_Date__c: booking.End_Date__c,
                            Status__c: booking.Status__c,
                            CustomerName: customerName,
                            VehicleName: vehicleName
                        };
                    });
                } else {
                    this.bookings = [];
                }
            })
            .catch(error => {
                console.error('Error loading bookings:', error);
                this.showToast('Error', 'Error loading bookings. ' + (error.body?.message || ''), 'error');
                this.bookings = [];
            });
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'cancel') {
            this.cancel(row.Id);
        }
    }

    cancel(bookingId) {
        cancelBooking({ bookingId })
            .then(() => {
                this.showToast('Success', 'Booking cancelled successfully.', 'success');
                this.loadBookings(); // Refresh bookings after cancellation
            })
            .catch(error => {
                console.error('Cancel error:', error);
                this.showToast('Error', 'Failed to cancel booking. ' + (error.body?.message || ''), 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    connectedCallback() {
        this.updateOutdatedBookings();
    }

    updateOutdatedBookings() {
        updateOutdatedBookings()
        .then(() => {
            console.log('Outdated bookings updated.');
            this.loadBookings(); // Refresh bookings after update
        })
        .catch(error => {
            console.error('Error updating outdated bookings:', error);
            // Optionally: You can choose to not show a toast for minor background update errors
            // this.showToast('Error', 'Error updating outdated bookings. ' + (error.body?.message || ''), 'error');
            this.loadBookings(); // Still load bookings even if update failed
        });
    }
}