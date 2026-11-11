import { useState, useEffect } from "react";
import "./index.css";
import logo from "./assets/binzakk_logo.jpeg";

import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaMapMarkerAlt,
} from "react-icons/fa";

const WHATSAPP_NUMBER = "7012423204"; // Temporary fallback number
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");
const PACKAGES_API_URL = `${API_BASE_URL}/api/packages`;

// const [packages, setPackages] = useState([]);

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  
function openWhatsApp(message, travelPackage = null) {
  const number =
    travelPackage?.whatsapp_number || WHATSAPP_NUMBER;

  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  // Record enquiry click in Django
  fetch(`${PACKAGES_API_URL}/whatsapp-enquiry/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      package_id: travelPackage?.id || null,
      whatsapp_contact_id: travelPackage?.whatsapp_contact_id || null,
    }),
    keepalive: true,
  }).catch((error) => {
    console.error("Enquiry tracking failed:", error);
  });

  // Open WhatsApp
  window.open(url, "_blank", "noopener,noreferrer");
}

function PackageCard({ travelPackage, onViewDetails,onEnquire }) {
  return (
    <article className="package-card">
      <div className="package-image-wrap">
        <img
          src={
            travelPackage.main_image ||
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85"
          }
          alt={travelPackage.destination}
          className="package-image"
          loading="lazy"
        />

        {travelPackage.is_seasonal && (
          <span className="package-tag">SEASONAL</span>
        )}
      </div>

      <div className="package-content">
        <p className="package-destination">
          <span aria-hidden="true">⌖</span> {travelPackage.destination}
        </p>

        <h3>{travelPackage.title}</h3>

        <p className="package-description">
          {travelPackage.description}
        </p>

        <div className="package-duration">
          <span aria-hidden="true">◷</span>
          {travelPackage.duration_days} Days /{" "}
          {travelPackage.duration_nights} Nights
        </div>
        </div>
        <div className="package-bottom">
        <div>
          <span className="price-label">Starting from</span>

          <p className="package-price">
            {formatPrice(Number(travelPackage.price))}
            <span>
              {travelPackage.price_type === "Per Person"
                ? " / person"
                : " / group"}
            </span>
          </p>
        </div>

        <div className="package-actions">
          <button
            type="button"
            className="view-details-button"
            onClick={() => onViewDetails(travelPackage)}
          >
            View Details
          </button>

          <button
            type="button"
            className="package-button"
            onClick={() => onEnquire(travelPackage)}
          >
            Enquire ↗
          </button>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [enquiryPackage, setEnquiryPackage] = useState(null);
  const [enquiryForm, setEnquiryForm] = useState({
  customer_name: "",
  phone_number: "",
  email: "",
  trip_start_date: "",
  trip_end_date: "",
});

const [enquiryMessage, setEnquiryMessage] = useState("");
const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);

const [reviewForm, setReviewForm] = useState({
  customer_name: "",
  destination: "",
  review: "",
  rating: 5,
});

const [photoForm, setPhotoForm] = useState({
  customer_name: "",
  destination: "",
  caption: "",
  image: null,
  consent: false,
});

const [reviewMessage, setReviewMessage] = useState("");
const [photoMessage, setPhotoMessage] = useState("");
const [visibleGalleryCount, setVisibleGalleryCount] = useState(3);
const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState(null);
const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
const [reviewsNext, setReviewsNext] = useState(null);
const [galleryNext, setGalleryNext] = useState(null);


  useEffect(() => {
  fetch(`${PACKAGES_API_URL}/`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to load packages");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Packages data:", data);
      setPackages(data);
    })
    .catch((err) => {
      console.error(err);
      setError("Unable to load packages.");
    })
    .finally(() => setLoading(false));
}, []);

  useEffect(() => {
  fetch(`${PACKAGES_API_URL}/reviews/`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Unable to load reviews");
      }
      return res.json();
    })
    .then((data) => {
      setReviews(data.results);
      setReviewsNext(data.next);
    })
    .catch((err) => console.error("Reviews error:", err));

  fetch(`${PACKAGES_API_URL}/gallery/`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Unable to load gallery");
      }
      return res.json();
    })
    .then((data) => {
      setGallery(data.results);
      setGalleryNext(data.next);
    })
    .catch((err) => console.error("Gallery error:", err));
}, []);

const handleEnquirySubmit = async (event) => {
  event.preventDefault();

  if (!enquiryPackage) return;

  setEnquiryMessage("");
  setEnquirySubmitting(true);

  try {
    const response = await fetch(
      `${PACKAGES_API_URL}/customer-enquiry/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...enquiryForm,
          package: enquiryPackage.id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      throw new Error("Unable to submit your enquiry.");
    }

    const whatsappNumber =
      enquiryPackage.whatsapp_number || WHATSAPP_NUMBER;

    const emailText = enquiryForm.email
      ? `\nEmail: ${enquiryForm.email}`
      : "";

    const whatsappMessage =
      `Hello BINZAKK Travels!\n\n` +
      `I am interested in the ${enquiryPackage.title} package.\n\n` +
      `Name: ${enquiryForm.customer_name}\n` +
      `Phone: ${enquiryForm.phone_number}` +
      emailText +
      `\nTrip Start Date: ${enquiryForm.trip_start_date}\n` +
      `Trip End Date: ${enquiryForm.trip_end_date}`;

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}?text=` +
      encodeURIComponent(whatsappMessage);

    // Record WhatsApp enquiry click
    fetch(
      `${PACKAGES_API_URL}/whatsapp-enquiry/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          package_id: enquiryPackage.id,
          whatsapp_contact_id:
            enquiryPackage.whatsapp_contact_id || null,
        }),
        keepalive: true,
      }
    ).catch((error) => {
      console.error("Enquiry tracking failed:", error);
    });

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    setEnquiryForm({
      customer_name: "",
      phone_number: "",
      email: "",
      trip_start_date: "",
      trip_end_date: "",
    });

    setEnquiryPackage(null);
  } catch (error) {
    console.error(error);
    setEnquiryMessage(
      error.message || "Something went wrong. Please try again."
    );
  } finally {
    setEnquirySubmitting(false);
  }
};



const handleReviewSubmit = async (event) => {
  event.preventDefault();
  setReviewMessage("");

  try {
    const response = await fetch(
      `${PACKAGES_API_URL}/reviews/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewForm),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Unable to submit review.");
    }

    setReviews((previous) => [data, ...previous]);

    setReviewForm({
      customer_name: "",
      destination: "",
      review: "",
      rating: 5,
    });

    setReviewMessage("Thank you! Your review has been submitted.");
  } catch (error) {
    setReviewMessage(error.message);
  }
};


const handlePhotoSubmit = async (event) => {
  event.preventDefault();
  setPhotoMessage("");

  if (!photoForm.image) {
    setPhotoMessage("Please select a photo.");
    return;
  }

  const formData = new FormData();

  formData.append("customer_name", photoForm.customer_name);
  formData.append("destination", photoForm.destination);
  formData.append("caption", photoForm.caption);
  formData.append("image", photoForm.image);
  formData.append("consent", photoForm.consent ? "true" : "false");

  try {
    const response = await fetch(
      `${PACKAGES_API_URL}/gallery/`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gallery upload error:", data);

      const errorMessage =
        data.detail ||
        Object.values(data).flat().join(" ") ||
        "Unable to upload photo.";

      throw new Error(errorMessage);
    }

    setGallery((previous) => [data, ...previous]);

    setPhotoForm({
      customer_name: "",
      destination: "",
      caption: "",
      image: null,
      consent: false,
    });

    event.target.reset();

    setPhotoMessage("Your travel photo has been uploaded!");
  } catch (error) {
    setPhotoMessage(error.message);
  }
};



const handleShowMoreGallery = async () => {
  if (!galleryNext) return;

  try {
    console.log("Next gallery URL:", galleryNext);
    const response = await fetch(galleryNext);

    if (!response.ok) {
      throw new Error("Unable to load more photos");
    }

    const data = await response.json();
    console.log("More gallery data:", data);

    setGallery((previous) => [
      ...previous,
      ...data.results,
    ]);

    setGalleryNext(data.next);
  } catch (error) {
    console.error("Show more gallery error:", error);
  }
};

const handleShowLessGallery = async () => {
  try {
    const response = await fetch(
      `${PACKAGES_API_URL}/gallery/`
    );

    if (!response.ok) {
      throw new Error("Unable to reload gallery");
    }

    const data = await response.json();

    setGallery(data.results);
    setGalleryNext(data.next);
  } catch (error) {
    console.error("Show less gallery error:", error);
  }
};

const loadMoreReviews = async () => {
  if (!reviewsNext) return;

  try {
    const response = await fetch(reviewsNext);
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Unable to load more reviews.");
    }

    setReviews((previous) => [...previous, ...data.results]);
    setReviewsNext(data.next);
    setVisibleReviewsCount((previous) => previous + 3);
  } catch (error) {
    console.error(error);
  }
};

const loadMoreGallery = async () => {
  if (!galleryNext) return;

  try {
    const response = await fetch(galleryNext);
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Unable to load more photos.");
    }

    setGallery((previous) => [...previous, ...data.results]);
    setGalleryNext(data.next);
    setVisibleGalleryCount((previous) => previous + 3);
  } catch (error) {
    console.error(error);
  }
};
  const filteredPackages = packages.filter((travelPackage) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    (travelPackage.title || "").toLowerCase().includes(searchText) ||
    (travelPackage.destination || "").toLowerCase().includes(searchText);

  let matchesCategory = true;

  if (activeCategory === "Domestic") {
    matchesCategory =
      travelPackage.category === "Domestic" &&
      (activeSubCategory === "All" ||
        travelPackage.domestic_region === activeSubCategory);
  } else if (activeCategory === "Special") {
    matchesCategory =
      travelPackage.category === "Special" &&
      (activeSubCategory === "All" ||
        travelPackage.special_type === activeSubCategory);
  } else if (activeCategory === "International") {
    matchesCategory = travelPackage.category === "International";
  }

  return matchesCategory && matchesSearch;
});

  return (
    <div className="website">
      <div className="announcement-bar">
        <p>
          Your next adventure starts here.
          <span> Let's explore the world together!</span>
        </p>
      </div>

      <header className="site-header">
        <nav className="navbar container">
          <a href="#home" className="brand" aria-label="binzakk home">
            <div className="brand-symbol">
              <img src={logo} alt="binzakk Logo" className="brand-logo" />
            </div>

            <span className="brand-text">
              BINZAKK
              <small>TRAVELS & HOLIDAYS</small>
            </span>
          </a>

          <div className="nav-links">
            <a href="#home" className="nav-link active">
              Home
            </a>
            <a href="#packages" className="nav-link">
              Packages
            </a>
            <a href="#destinations" className="nav-link">
              Destinations
            </a>
            <a href="#about" className="nav-link">
              About Us
            </a>
            <a href="#contact" className="nav-link">
              Contact
            </a>
          </div>

          <button
            className="nav-cta"
            onClick={() =>
              openWhatsApp(
                "Hello BINZAKK Travels! I would like help planning my next trip."
              )
            }
          >
            Plan My Trip <span aria-hidden="true">↗</span>
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-background" />

          <div className="container hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              YOUR JOURNEY, OUR PASSION
            </div>

            <h1>
              The world is
              <br />
              waiting for <span>you.</span>
            </h1>

            <p className="hero-description">
              Discover extraordinary destinations, unforgettable experiences
              and journeys that become your favourite memories.
            </p>

            <div className="hero-actions">
              <a href="#packages" className="primary-button">
                Explore Packages <span aria-hidden="true">→</span>
              </a>

              <a href="#about" className="secondary-button">
                Discover Binzakk
              </a>
            </div>

            <div className="hero-trust">
              <div className="trust-icon" aria-hidden="true">
                ✓
              </div>

              <div>
                <strong>Made for explorers</strong>
                <p>Thoughtfully planned travel experiences</p>
              </div>
            </div>
          </div>

          <a href="#packages" className="hero-scroll">
            SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
          </a>

          <div className="hero-index">
            <span>01</span> / 06
          </div>
        </section>

        <section className="search-section" id="destinations">
          <div className="container">
            <div className="search-panel">
              <div className="search-heading">
                <span className="search-icon" aria-hidden="true">
                  ⌕
                </span>

                <div>
                  <h2>Find your next escape</h2>
                  <p>Where would you like to go?</p>
                </div>
              </div>

              <div className="search-input-wrap">
                <label htmlFor="destination-search">Destination</label>

                <input
                  id="destination-search"
                  type="search"
                  placeholder="Try Manali, Munnar, Dubai..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    document
                      .getElementById("packages")
                      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }}
                />
              </div>

              <button
                className="search-button"
                onClick={() =>
                  document
                    .getElementById("packages")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Trips <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>

        <section className="packages-section section-padding" id="packages">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">CURATED FOR YOU</span>
                <h2>
                  Find your kind
                  <br />
                  of <span>adventure.</span>
                </h2>
              </div>

              <p>
                From peaceful mountain escapes to exciting international
                journeys, discover a trip that feels made just for you.
              </p>
            </div>

            <div className="package-filters">
  {["All", "Domestic", "International", "Special"].map((category) => (
    <button
      key={category}
      className={`filter-button ${
        activeCategory === category ? "selected" : ""
      }`}
      onClick={() => {
        setActiveCategory(category);
        setActiveSubCategory("All");
      }}
    >
      {{
        All: "All Packages",
        Domestic: "India",
        International: "International",
        Special: "Special Packages",
      }[category]}
    </button>
  ))}
</div>

{activeCategory === "Domestic" && (
  <div className="package-filters sub-filters">
    {["All", "South India", "North India"].map((region) => (
      <button
        key={region}
        className={`filter-button ${
          activeSubCategory === region ? "selected" : ""
        }`}
        onClick={() => setActiveSubCategory(region)}
      >
        {region === "All" ? "All India" : region}
      </button>
    ))}
  </div>
)}

{activeCategory === "Special" && (
  <div className="package-filters sub-filters">
    {[
      { value: "All", label: "All Special Trips" },
      { value: "IV Trip", label: "IV Trip" },
      { value: "Strangers Trip", label: "Strangers Trip" },
      { value: "Group Trip", label: "Group Trip" },
      { value: "Other", label: "Other Special Trips" },
    ].map((type) => (
      <button
        key={type.value}
        className={`filter-button ${
          activeSubCategory === type.value ? "selected" : ""
        }`}
        onClick={() => setActiveSubCategory(type.value)}
      >
        {type.label}
      </button>
    ))}
  </div>
)}
            {loading && <p>Loading travel packages...</p>}

            {error && <p role="alert">{error}</p>}

            <div className="package-grid">
              {filteredPackages.map((travelPackage) => (
                <PackageCard
                  key={travelPackage.id}
                  travelPackage={travelPackage}
                  onViewDetails={setSelectedPackage}
                  onEnquire={setEnquiryPackage}
                />
              ))}
            </div>

            {filteredPackages.length === 0 && (
              <div className="empty-state">
                <span aria-hidden="true">⌕</span>
                <h3>No matching packages found</h3>
                <p>Try another destination or change your category.</p>

                <button
                  className="reset-button"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                  }}
                >
                  Show all packages
                </button>
              </div>
            )}

            <p className="sample-note">
  Package prices and availability must be confirmed with BINZAKK before booking.
          </p>
          </div>
        </section>

        <section className="experience-section" id="about">
          <div className="container experience-grid">
            <div className="experience-visual">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85"
                alt="Majestic mountain peaks"
                loading="lazy"
              />

              <div className="experience-note">
                <span className="experience-note-icon" aria-hidden="true">
                  ✦
                </span>

                <div>
                  <strong>Travel beyond ordinary</strong>
                  <p>Make every journey count.</p>
                </div>
              </div>
            </div>

            <div className="experience-content">
              <span className="eyebrow">THE BINZAKK EXPERIENCE</span>

              <h2>
                More than a trip.
                <br />
                A story <span>to remember.</span>
              </h2>

              <p>
                Every journey brings a new perspective. At binzakk, our goal is
                to help you discover beautiful places, experience new cultures
                and create memories worth sharing.
              </p>

              <div className="benefit-list">
                <div className="benefit-item">
                  <span className="benefit-icon" aria-hidden="true">
                    ↗
                  </span>

                  <div>
                    <h3>Trips tailored to you</h3>
                    <p>Explore travel options that suit your preferences.</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <span className="benefit-icon" aria-hidden="true">
                    ◈
                  </span>

                  <div>
                    <h3>Clear package details</h3>
                    <p>Discuss pricing, itineraries and inclusions before booking.</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <span className="benefit-icon" aria-hidden="true">
                    ♡
                  </span>

                  <div>
                    <h3>Personal enquiry support</h3>
                    <p>Contact our team directly to plan your next getaway.</p>
                  </div>
                </div>
              </div>

              <button
                className="primary-button experience-button"
                onClick={() =>
                  openWhatsApp(
                    "Hello Binzakk Travels! Please help me plan a personalised trip."
                  )
                }
              >
                Let's Plan Together <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>
        

        {/* CUSTOMER EXPERIENCES */}

<section className="customer-reviews section-padding" id="reviews">
  <div className="container">

    <div className="section-heading">
      <div>
        <span className="eyebrow">CUSTOMER STORIES</span>
        <h2>
          Memories that <span>matter.</span>
        </h2>
      </div>

      <p>Read about the beautiful journeys shared by our customers.</p>
    </div>

   <div className="reviews-grid">
  {reviews.slice(0, visibleReviewsCount).map((item) => (
    <article className="review-card" key={item.id}>
      <div className="review-stars">
        {"★".repeat(item.rating)}
        {"☆".repeat(5 - item.rating)}
      </div>

      <p className="review-text">"{item.review}"</p>

      <h3>{item.customer_name}</h3>
      <span>{item.destination}</span>
    </article>
  ))}
</div>

{reviewsNext && (
  <div className="gallery-more">
    <button
      className="primary-button"
      onClick={loadMoreReviews}
    >
      Show More Reviews ↓
    </button>
  </div>
)}

{visibleReviewsCount > 3 && (
  <div className="gallery-more">
    <button
      className="primary-button"
      onClick={() => setVisibleReviewsCount(3)}
    >
      Show Less ↑
    </button>
  </div>
)}

    {reviews.length === 0 && (
      <p className="empty-state">Be the first to share your travel experience!</p>
    )}

    <div className="review-form-card">
      <h3>Share Your Experience</h3>

      <form onSubmit={handleReviewSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={reviewForm.customer_name}
          onChange={(e) =>
            setReviewForm({ ...reviewForm, customer_name: e.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Destination"
          value={reviewForm.destination}
          onChange={(e) =>
            setReviewForm({ ...reviewForm, destination: e.target.value })
          }
          required
        />

        <label>Your Rating</label>

        <select
          value={reviewForm.rating}
          onChange={(e) =>
            setReviewForm({ ...reviewForm, rating: Number(e.target.value) })
          }
        >
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} Stars
            </option>
          ))}
        </select>

        <textarea
          placeholder="Tell us about your journey..."
          value={reviewForm.review}
          onChange={(e) =>
            setReviewForm({ ...reviewForm, review: e.target.value })
          }
          required
        />

        <button type="submit" className="primary-button">
          Submit Review →
        </button>

        {reviewMessage && <p>{reviewMessage}</p>}
      </form>
    </div>

  </div>
</section>


{/* CUSTOMER TRAVEL PHOTO GALLERY */}

<section className="customer-gallery section-padding" id="gallery">
  <div className="container">

    <div className="section-heading">
      <div>
        <span className="eyebrow">TRAVEL MOMENTS</span>
        <h2>
          Memories that <span>last forever.</span>
        </h2>
      </div>

      <p>
        Real journeys, beautiful destinations and unforgettable
        moments shared by our happy travellers.
      </p>
    </div>

    <div className="gallery-grid">
      {gallery.map((photo) => (
        <article
          className="gallery-card"
          key={photo.id}
          onClick={() => setSelectedGalleryPhoto(photo)}
        >
          <div className="gallery-image-wrapper">
            <img
              src={photo.image}
              alt={photo.destination}
              loading="lazy"
            />

            <div className="gallery-overlay">
              <span>View Memory ↗</span>
            </div>
          </div>

          <div className="gallery-info">
            <span className="gallery-location">
              TRAVEL DESTINATION
            </span>

            <h3>{photo.destination}</h3>

            {photo.caption && <p>{photo.caption}</p>}

            {photo.customer_name && (
              <span className="gallery-customer">
                Shared by {photo.customer_name}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
    

    {gallery.length === 0 && (
  <p className="empty-state">
    No travel photos shared yet.
  </p>
)}

<div className="gallery-show-more">
  {galleryNext && (
    <button
      type="button"
      className="secondary-button"
      onClick={handleShowMoreGallery}
    >
      Show More Photos
    </button>
  )}

  {gallery.length > 3 && (
    <button
      type="button"
      className="secondary-button"
      onClick={handleShowLessGallery}
    >
      Show Less
    </button>
  )}
</div>

    {selectedGalleryPhoto && (
      <div
        className="gallery-lightbox"
        onClick={() => setSelectedGalleryPhoto(null)}
      >
        <button
          className="lightbox-close"
          onClick={() => setSelectedGalleryPhoto(null)}
        >
          ×
        </button>

        <div
          className="lightbox-content"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={selectedGalleryPhoto.image}
            alt={selectedGalleryPhoto.destination}
          />

          <h3>{selectedGalleryPhoto.destination}</h3>

          <p>{selectedGalleryPhoto.caption}</p>
        </div>
      </div>
    )}

    <div className="photo-upload-card">
      <h3>Share Your Travel Memories</h3>

      <p>
        Have a beautiful travel memory? Share it with us!
      </p>

      <form onSubmit={handlePhotoSubmit}>
        <input
          type="text"
          placeholder="Your Name (Optional)"
          value={photoForm.customer_name}
          onChange={(e) =>
            setPhotoForm({
              ...photoForm,
              customer_name: e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Destination"
          value={photoForm.destination}
          onChange={(e) =>
            setPhotoForm({
              ...photoForm,
              destination: e.target.value,
            })
          }
          required
        />

        <input
          type="text"
          placeholder="Photo Caption"
          value={photoForm.caption}
          onChange={(e) =>
            setPhotoForm({
              ...photoForm,
              caption: e.target.value,
            })
          }
        />

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) =>
            setPhotoForm({
              ...photoForm,
              image: e.target.files[0],
            })
          }
          required
        />

        <label className="photo-consent">
          <input
            type="checkbox"
            required
            onChange={(e) =>
              setPhotoForm({
                ...photoForm,
                consent: e.target.checked,
              })
            }
          />

          <span>
            I agree to share this photo publicly on the Binzakk Travels
            website. I confirm that I have permission to share this photo.
          </span>
        </label>

        <button type="submit" className="primary-button">
          Share My Photo →
        </button>

        {photoMessage && <p>{photoMessage}</p>}
      </form>
    </div>

  </div>
</section>


        <section className="cta-section">
          <div className="container cta-content">
            <span className="eyebrow">YOUR NEXT CHAPTER BEGINS HERE</span>

            <h2>
              Somewhere amazing
              <br />
              is calling <span>your name.</span>
            </h2>

            <p>
              Tell us your dream destination. Let's start planning your next
              unforgettable journey.
            </p>

            <button
              className="cta-button"
              onClick={() =>
                openWhatsApp(
                  "Hello Binzakk Travels! I want to plan a trip. Please help me with available packages."
                )
              }
            >
              Start Your Journey <span aria-hidden="true">↗</span>
            </button>
          </div>
        </section>
      </main>
      {enquiryPackage && (
  <div
    className="enquiry-overlay"
    onClick={() => setEnquiryPackage(null)}
  >
    <div
      className="enquiry-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="enquiry-close"
        onClick={() => setEnquiryPackage(null)}
        aria-label="Close enquiry form"
      >
        ✕
      </button>

      <span className="eyebrow">TRAVEL ENQUIRY</span>

      <h2>{enquiryPackage.title}</h2>

      <p className="enquiry-package-info">
        Fill in your travel details and our team will assist you.
      </p>

      <form
        className="enquiry-form"
        onSubmit={handleEnquirySubmit}
      >
        <input
          type="text"
          placeholder="Your Name"
          value={enquiryForm.customer_name}
          onChange={(event) =>
            setEnquiryForm({
              ...enquiryForm,
              customer_name: event.target.value,
            })
          }
          required
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={enquiryForm.phone_number}
          onChange={(event) =>
            setEnquiryForm({
              ...enquiryForm,
              phone_number: event.target.value,
            })
          }
          required
        />

        <input
          type="email"
          placeholder="Email Address (Optional)"
          value={enquiryForm.email}
          onChange={(event) =>
            setEnquiryForm({
              ...enquiryForm,
              email: event.target.value,
            })
          }
        />

        <label>
          Trip Start Date
          <input
            type="date"
            value={enquiryForm.trip_start_date}
            onChange={(event) =>
              setEnquiryForm({
                ...enquiryForm,
                trip_start_date: event.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Trip End Date
          <input
            type="date"
            value={enquiryForm.trip_end_date}
            onChange={(event) =>
              setEnquiryForm({
                ...enquiryForm,
                trip_end_date: event.target.value,
              })
            }
            required
          />
        </label>

        <button
          type="submit"
          className="primary-button enquiry-submit"
          disabled={enquirySubmitting}
        >
          {enquirySubmitting
            ? "Submitting..."
            : "Continue to WhatsApp ↗"}
        </button>

        {enquiryMessage && (
          <p className="enquiry-message">
            {enquiryMessage}
          </p>
        )}
      </form>
    </div>
  </div>
)}

      {selectedPackage && (
  <div className="details-overlay">
    <div className="details-modal">

      <button
        className="details-close"
        onClick={() => setSelectedPackage(null)}
      >
        ✕
      </button>

            <div className="details-images">
        {selectedPackage.main_image && (
          <img
            src={selectedPackage.main_image}
            alt={selectedPackage.destination}
            className="details-image"
          />
        )}

        {selectedPackage.images?.map((photo) => (
          <img
            key={photo.id}
            src={photo.image}
            alt={photo.caption || selectedPackage.destination}
            className="details-extra-image"
          />
        ))}
      </div>

      <div className="details-content">

        <span className="eyebrow">
          {selectedPackage.category} PACKAGE
        </span>

        <h2>{selectedPackage.title}</h2>

        <p className="package-destination">
          ⌖ {selectedPackage.destination}
        </p>

        <p>{selectedPackage.description}</p>

        <h3>Package Duration</h3>

        <p>
          {selectedPackage.duration_days} Days /{" "}
          {selectedPackage.duration_nights} Nights
        </p>

        <h3>Price</h3>

        <p className="package-price">
          {formatPrice(Number(selectedPackage.price))}
        </p>

        <h3>Travel Itinerary</h3>

        <p className="details-itinerary">
          {selectedPackage.itinerary || "Contact us for the itinerary."}
        </p>

        <button
          type="button"
          className="package-button"
          onClick={() => onEnquire(travelPackage)}
        >
          Enquire ↗
        </button>

      </div>
    </div>
  </div>
)}

      <footer className="site-footer" id="contact">
        <div className="container footer-grid">
          <div className="footer-brand-column">
            <a href="#home" className="brand footer-brand">
              <div className="brand-symbol">
                <img src={logo} alt="binzakk Logo" className="brand-logo" />
              </div>

              <span className="brand-text">
                BINZAKK
                <small>TRAVELS & HOLIDAYS</small>
              </span>
            </a>

            <p>
              Discover the world, one beautiful journey at a time. Your next
              adventure starts with Binzakk.
            </p>

            <button
              className="footer-whatsapp"
              onClick={() =>
                openWhatsApp(
                  "Hello Binzakk Travels! I would like to make a travel enquiry."
                )
              }
            >
              Chat with us on WhatsApp ↗
            </button>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>
            <a href="#home">Home</a>
            <a href="#packages">Travel Packages</a>
            <a href="#destinations">Destinations</a>
            <a href="#about">About BINZAKK</a>
          </div>

          <div className="footer-column">
            <h3>Popular Trips</h3>
            <a href="#packages">Manali</a>
            <a href="#packages">Matheran</a>
            <a href="#packages">Kashmir</a>
            <a href="#packages">International Holidays</a>
          </div>

          <div className="footer-column">
            <h3>Get in Touch</h3>

            <p>Have a destination in mind?</p>
            <p>Contact us for package details and availability.</p>

            <div className="contact-details">
              <p>📞 Phone: <a href="tel:+7012423204">+91 7012423204</a></p>

          <p>
            💬 WhatsApp:{" "}
            <a
              href="https://wa.me/917012423204"
              target="_blank"
              rel="noreferrer"
            >
              Chat with us
            </a>
          </p>

          <p>✉️ Email: <a href="mailto:knrbinzakk@gmail.com">knrbinzakk@gmail.com</a></p>

          <p>📍 Office: Thottada,Kannur,Kerala 
          </p>

            </div>

            <h3 className="social-heading">Follow Us</h3>

            <div className="social-links">
              <a
                href="https://www.instagram.com/journeywithsolivagant/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>

              <a href="#" aria-label="YouTube">
                <FaYoutube />
              </a>

              <a href="#" aria-label="Google Maps">
                <FaMapMarkerAlt />
              </a>
            </div>

          <button
          className="footer-contact-button"
          onClick={() =>
          openWhatsApp(
          "Hello Binzakk Travels! I have a question about your travel packages."
          )
          }

          >

          Send an Enquiry →
            </button>
          </div>
          </div>


        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <p>© {new Date().getFullYear()} BINZAKK Travels. All rights reserved.</p>
            <a href="#home">Back to top ↑</a>
          </div>
        </div>
      </footer>

      <button
        className="floating-whatsapp"
        aria-label="Enquire through WhatsApp"
        title="Chat with binzakk"
        onClick={() =>
          openWhatsApp(
            "Hello Binzakk Travels! I would like to know more about your travel packages."
          )
        }
      >
        <svg
          viewBox="0 0 32 32"
          width="27"
          height="27"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M16.02 3C8.85 3 3.01 8.8 3.01 15.94c0 2.28.6 4.5 1.74 6.46L3 29l6.8-1.78a13.1 13.1 0 0 0 6.22 1.57h.01c7.17 0 13.01-5.8 13.01-12.94C29.04 8.8 23.2 3 16.02 3Zm0 23.6a10.9 10.9 0 0 1-5.55-1.52l-.4-.24-4.03 1.06 1.08-3.92-.26-.41a10.75 10.75 0 0 1-1.65-5.63c0-5.95 4.87-10.79 10.82-10.79 2.88 0 5.59 1.12 7.63 3.15a10.68 10.68 0 0 1 3.17 7.62c0 5.95-4.86 10.78-10.81 10.78Zm5.94-8.07c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.27-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.59-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.5.14-.66.15-.15.32-.38.48-.57.16-.19.21-.32.32-.54.1-.21.05-.4-.03-.56-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.55-.73-.56h-.62c-.22 0-.57.08-.86.4-.3.32-1.13 1.1-1.13 2.67 0 1.58 1.16 3.1 1.32 3.31.16.22 2.28 3.47 5.52 4.86.77.33 1.37.53 1.84.68.77.24 1.47.21 2.03.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
        </svg>
      </button>
    </div>
  );
}

export default App;
