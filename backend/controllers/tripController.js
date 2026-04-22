// Data Trip (Pindahan dari server.js lama)
const TRIPS_DATA = [
    { id: 1, title: "West Trip Tour", price: 299000, location: "Nusa Penida" },
    { id: 2, title: "East Trip Tour", price: 299000, location: "Nusa Penida" }
  ];
  
  // Fungsi Ambil Semua Trip
  exports.getAllTrips = (req, res) => {
    res.status(200).json(TRIPS_DATA);
  };
  
  // Fungsi Ambil Trip berdasarkan ID
  exports.getTripById = (req, res) => {
    const trip = TRIPS_DATA.find(t => t.id === parseInt(req.params.id));
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.status(200).json(trip);
  };