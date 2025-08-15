import { LightningElement, wire, track } from 'lwc';
import getBookingStats from '@salesforce/apex/BookingController.getBookingStats';
import getAllBookings from '@salesforce/apex/BookingController.getAllBookings';
// import getCurrentUserProfile from '@salesforce/apex/BookingController.getCurrentUserProfile';
// import updateOutdatedBookings from '@salesforce/apex/BookingController.updateOutdatedBookings';

export default class BookingDashboard extends LightningElement {
    @track bookings = [];
    @track totalBookings = 0;
    @track vehicleStats = [];
    @track chart;

    connectedCallback() {
        this.fetchBookings();
        this.fetchBookingStats();
        // this.fetchUserProfile();
        // this.updateOutdatedBookings();
    }

    fetchBookings() {
        getAllBookings()
            .then(result => {
                this.bookings = result;
                this.updateChart();
            })
            .catch(error => {
                console.error('Error fetching bookings:', error);
            });
    }

    fetchBookingStats() {
        getBookingStats()
            .then(result => {
                this.totalBookings = result.total;
                this.vehicleStats = result.vehicleStats;
                this.updateChart();
            })
            .catch(error => {
                console.error('Error fetching booking stats:', error);
            });
    }

    // fetchUserProfile() {
    //     getCurrentUserProfile()
    //         .then(profile => {
    //             console.log('User Profile:', profile);
    //         })
    //         .catch(error => {
    //             console.error('Error fetching user profile:', error);
    //         });
    // }

    // updateOutdatedBookings() {
    //     updateOutdatedBookings()
    //         .then(() => {
    //             console.log('Outdated bookings updated.');
    //         })
    //         .catch(error => {
    //             console.error('Error updating outdated bookings:', error);
    //         });
    // }

    updateChart() {
        // Your chart update logic here
    }
}