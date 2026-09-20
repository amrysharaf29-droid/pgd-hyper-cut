const firebaseConfig = {
  apiKey: "AIzaSyClDEBdaDgY0-MwbRvmqWt91-gohrSNnBM",
  authDomain: "salonbooking-81fe3.firebaseapp.com",
  projectId: "salonbooking-81fe3",
  storageBucket: "salonbooking-81fe3.firebasestorage.app",
  messagingSenderId: "45699636609",
  appId: "1:45699636609:web:db693345fee79e84549c80",
  measurementId: "G-3V1R0T0M7L"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


// ADMIN LOGIN
function adminLogin() {

    const email =
        document.getElementById("adminEmail").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    const errorBox =
        document.getElementById("loginError");


    if (!email || !password) {

        errorBox.textContent =
            "Please enter email and password.";

        return;
    }


    firebase.auth()
        .signInWithEmailAndPassword(email, password)

        .then(() => {

            document.getElementById("loginBox").style.display =
                "none";

            document.getElementById("adminPanel").style.display =
                "block";

            loadBookings();

        })

        .catch((error) => {

            console.error(error);

            errorBox.textContent =
                "Invalid email or password.";

        });

}


// LOAD BOOKINGS
function loadBookings() {

    db.collection("bookings")
        .orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {

            const bookingsDiv =
                document.getElementById("bookings");

            bookingsDiv.innerHTML = "";


            if (snapshot.empty) {

                bookingsDiv.innerHTML =
                    "<p>No bookings yet.</p>";

                return;
            }


            snapshot.forEach((doc) => {

                const booking = doc.data();


                const card =
                    document.createElement("div");

                card.className = "booking-card";


                card.innerHTML = `

                    <h2>${booking.name}</h2>

                    <p>
                        📱 ${booking.phone}
                    </p>

                    <p>
                        ✂️ ${booking.service}
                    </p>

                    <p>
                        📅 ${booking.date}
                    </p>

                    <p>
                        ⏰ ${booking.time}
                    </p>

                    <span class="status">
                        ${booking.status}
                    </span>
                    <div class="booking-actions">

    <button onclick="acceptBooking('${doc.id}')">
        ACCEPT
    </button>

    <button onclick="rejectBooking('${doc.id}')">
        REJECT
    </button>

</div>

                `;


                bookingsDiv.appendChild(card);

            });

        });

}
async function acceptBooking(bookingId) {

    try {

        const doc = await db.collection("bookings")
            .doc(bookingId)
            .get();

        const booking = doc.data();

        await db.collection("bookings")
            .doc(bookingId)
            .update({
                status: "accepted"
            });

        const message =
            "✅ *PGD HYPER CUT – BOOKING CONFIRMED*%0A%0A" +
            "👤 Name: " + encodeURIComponent(booking.name) + "%0A" +
            "✂️ Service: " + encodeURIComponent(booking.service) + "%0A" +
            "📅 Date: " + encodeURIComponent(booking.date) + "%0A" +
            "⏰ Time: " + encodeURIComponent(booking.time) + "%0A%0A" +
            "Your appointment has been confirmed. ❤️";

        let customerPhone = booking.phone.replace(/\D/g, "");

if (customerPhone.startsWith("0")) {
    customerPhone = "94" + customerPhone.substring(1);
}

if (customerPhone.startsWith("94") === false) {
    customerPhone = "94" + customerPhone;
}

const whatsappURL =
    "https://wa.me/" +
    customerPhone +
    "?text=" +
    message;

       window.location.href = whatsappURL;

        alert("Booking Accepted ✅");

    } catch (error) {

        console.error(error);
        alert("Could not accept booking.");

    }

}


async function rejectBooking(bookingId) {

    try {

        const doc = await db.collection("bookings")
            .doc(bookingId)
            .get();

        const booking = doc.data();

        await db.collection("bookings")
            .doc(bookingId)
            .update({
                status: "rejected"
            });

        let customerPhone =
            booking.phone.replace(/\D/g, "");

        if (customerPhone.startsWith("0")) {
            customerPhone =
                "94" + customerPhone.substring(1);
        }

        if (!customerPhone.startsWith("94")) {
            customerPhone = "94" + customerPhone;
        }

        const message =
            "❌ *PGD HYPER CUT – BOOKING UPDATE*%0A%0A" +
            "👤 Name: " + encodeURIComponent(booking.name) + "%0A" +
            "✂️ Service: " + encodeURIComponent(booking.service) + "%0A" +
            "📅 Date: " + encodeURIComponent(booking.date) + "%0A" +
            "⏰ Time: " + encodeURIComponent(booking.time) + "%0A%0A" +
            "Sorry, your requested appointment could not be accepted.%0A" +
            "Please contact us to choose another available time.";

        const whatsappURL =
            "https://wa.me/" +
            customerPhone +
            "?text=" +
            message;

        window.location.href = whatsappURL;

        alert("Booking Rejected ❌");

    } catch (error) {

        console.error(error);
        alert("Could not reject booking.");

    }

}

document.getElementById("adminPanel").style.display = "none";
document.getElementById("loginBox").style.display = "block";

function adminLogout() {

    firebase.auth().signOut()
        .then(() => {

            document.getElementById("adminPanel").style.display = "none";
            document.getElementById("loginBox").style.display = "block";

            document.getElementById("adminEmail").value = "";
            document.getElementById("adminPassword").value = "";

        })
        .catch((error) => {

            console.error(error);
            alert("Logout failed.");

        });

}