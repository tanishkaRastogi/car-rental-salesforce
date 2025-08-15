import { LightningElement, track } from 'lwc';
import searchBookings from '@salesforce/apex/BookingController.searchBookings';

export default class BookingSearch extends LightningElement {
    @track searchTerm = '';
    @track bookings = [];
    @track noResults = false;

    columns = [
        { label: 'Booking Name', fieldName: 'Name' },
        { label: 'Customer', fieldName: 'CustomerName', type: 'text' },
        { label: 'Vehicle', fieldName: 'VehicleName', type: 'text' },
        { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date' },
        { label: 'End Date', fieldName: 'End_Date__c', type: 'date' }
    ];

    handleSearchChange(event) {
        this.searchTerm = event.detail.value;
    }

    handleSearch() {
        searchBookings({ searchTerm: this.searchTerm })
            .then(result => {
                this.bookings = result.map(b => ({
                    ...b,
                    CustomerName: b.Customer__r?.Name,
                    VehicleName: b.Vehicle__r?.Name
                }));
                this.noResults = this.bookings.length === 0;
            })
            .catch(error => {
                console.error('Search error:', error);
                this.bookings = [];
                this.noResults = true;
            });
    }
}