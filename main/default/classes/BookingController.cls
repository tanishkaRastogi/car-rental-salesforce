public with sharing class BookingController {

    @AuraEnabled
	public static Id saveBooking(String bookingName, Id customerId, Id vehicleId, Date startDate, Date endDate) {

    // Check for overlapping active bookings for the same vehicle
    List<Booking__c> overlappingBookings = [
        SELECT Id, Name 
        FROM Booking__c
        WHERE Vehicle__c = :vehicleId
        AND Status__c = 'Active'
        AND (
            (Start_Date__c <= :endDate AND End_Date__c >= :startDate)
        )
    ];

    if (!overlappingBookings.isEmpty()) {
        // If overlapping bookings exist, throw an error
        throw new AuraHandledException('Booking failed. This vehicle is already booked for the selected date range.');
    }

    // If no overlap, create the new booking
    Booking__c newBooking = new Booking__c(
        Name = bookingName,
        Customer__c = customerId,
        Vehicle__c = vehicleId,
        Start_Date__c = startDate,
        End_Date__c = endDate,
        Status__c = 'Active',
        Ignore_Validation__c = false // Always false when saving new bookings
    );

    insert newBooking;
    return newBooking.Id;
}

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getBookingStats() {
        Integer total = [SELECT COUNT() FROM Booking__c WHERE Status__c = 'Active'];

        List<AggregateResult> groupedResults = [
            SELECT Vehicle__r.Name vehicle, COUNT(Id) cnt
            FROM Booking__c
            WHERE Status__c = 'Active'
            GROUP BY Vehicle__r.Name
        ];

        List<Map<String, Object>> vehicleStats = new List<Map<String, Object>>();
        for (AggregateResult ar : groupedResults) {
            vehicleStats.add(new Map<String, Object>{
                'vehicle' => (String)ar.get('vehicle'),
                'count' => (Integer)ar.get('cnt')
            });
        }

        return new Map<String, Object>{
            'total' => total,
            'vehicleStats' => vehicleStats
        };
    }

    @AuraEnabled
    public static List<Booking__c> searchBookings(String searchTerm) {
        String query = '%' + searchTerm + '%';
        return [
            SELECT Id, Name, Start_Date__c, End_Date__c, 
                   Customer__r.Name, Vehicle__r.Name, Status__c
            FROM Booking__c
            WHERE Name LIKE :query
               OR Customer__r.Name LIKE :query
               OR Vehicle__r.Name LIKE :query
            ORDER BY CreatedDate DESC
            LIMIT 50
        ];
    }

    @AuraEnabled
    public static void cancelBooking(Id bookingId) {
        Booking__c bookingToCancel = [SELECT Id, Status__c FROM Booking__c WHERE Id = :bookingId LIMIT 1];
        bookingToCancel.Status__c = 'Cancelled';
        update bookingToCancel;
    }

    @AuraEnabled
    public static void updateBooking(Booking__c updatedBooking) {
        update updatedBooking;
    }

    @AuraEnabled(cacheable=true)
    public static List<Booking__c> getAllBookings() {
        return [
            SELECT Id, Name, Start_Date__c, End_Date__c,
                Customer__r.Name, Vehicle__r.Name, Status__c
            FROM Booking__c
            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled
    public static void updateOutdatedBookings() {
        try {
            Date today = Date.today();
            List<Booking__c> outdatedBookings = [
                SELECT Id, Status__c, End_Date__c 
                FROM Booking__c 
                WHERE End_Date__c < :today AND Status__c = 'Active'
            ];

            for (Booking__c booking : outdatedBookings) {
                booking.Status__c = 'Completed';
                booking.Ignore_Validation__c = true; // Bypass validation rule
            }

            if (!outdatedBookings.isEmpty()) {
                update outdatedBookings;
            }
        } catch (Exception ex) {
            throw new AuraHandledException('Error updating outdated bookings: ' + ex.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<User> getCustomerOptions() {
        return [SELECT Id, Name FROM User WHERE IsActive = TRUE];
    }

    @AuraEnabled(cacheable=true)
    public static List<Vehicle__c> getVehicleOptions() {
        return [SELECT Id, Name FROM Vehicle__c];
    }
}