// Database sementara (Array)
let bookings = [];

exports.createBooking = (req, res) => {
    try {
        const { tripId, customerName, date, passengers } = req.body;

        // Validasi sederhana
        if (!tripId || !customerName) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: tripId or customerName" 
            });
        }

        const newBooking = {
            id: bookings.length + 1,
            tripId,
            customerName,
            date,
            passengers,
            status: "Pending",
            createdAt: new Date()
        };

        bookings.push(newBooking);

        // REST Status 201: Success Created
        res.status(201).json({
            success: true,
            message: "Booking created successfully!",
            data: newBooking
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getAllBookings = (req, res) => {
    res.status(200).json(bookings);
};