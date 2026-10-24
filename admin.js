
const API_URL = "http://localhost:8080/api/bookings";

const credentials = sessionStorage.getItem("adminDemoCredentials");

if (!credentials) {
    window.location.replace("admin-login.html");
} else {
    loadBookings();
}

const bookingTable = document.getElementById("bookingTable");
const totalBookings = document.getElementById("totalBookings");
const totalTickets = document.getElementById("totalTickets");
const totalRevenue = document.getElementById("totalRevenue");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");

refreshBtn.addEventListener("click", loadBookings);

async function loadBookings() {
    if (!credentials) return;

    message.textContent = "Loading bookings...";
    refreshBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": "Basic " + credentials
            }
        });

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("adminDemoCredentials");
            window.location.replace("admin-login.html");
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to fetch bookings");
        }

        const bookings = await response.json();

        if (!Array.isArray(bookings)) {
            throw new Error("Invalid response from backend");
        }

        bookingTable.innerHTML = "";

        let ticketsCount = 0;
        let revenue = 0;

        bookings.forEach((booking) => {
            ticketsCount += Number(booking.tickets) || 0;
            revenue += Number(booking.totalAmount) || 0;

            const row = document.createElement("tr");

            const values = [
                booking.id,
                booking.customerName,
                booking.movieName,
                booking.showDate,
                booking.showTime,
                booking.selectedSeats,
                booking.tickets,
                "₹" + Number(booking.totalAmount || 0).toFixed(2)
            ];

            values.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "-";
                row.appendChild(cell);
            });

            bookingTable.appendChild(row);
        });

        totalBookings.textContent = bookings.length;
        totalTickets.textContent = ticketsCount;
        totalRevenue.textContent = "₹" + revenue.toFixed(2);

        message.textContent = bookings.length === 0
            ? "No bookings found."
            : bookings.length + " booking(s) loaded successfully.";

    } catch (error) {
        console.error(error);
        message.textContent =
            "Unable to load bookings. Check backend connection.";
    } finally {
        refreshBtn.disabled = false;
    }
    document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("adminDemoCredentials");
    window.location.replace("admin-login.html");
});
}
