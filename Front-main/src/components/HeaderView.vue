<template>
  <header class="header">
    <!-- Search Bar -->
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        @input="handleSearch" 
        placeholder="Search..." 
        type="text" 
        class="search-input"
      />
      <button type="submit" @click="submitSearch">Go</button>
    </div>

    <!-- Search Results Dropdown -->
    <div v-if="searchQuery.trim() && searchResults.length > 0" class="search-dropdown" ref="searchDropdown">
      <ul>
        <li v-for="task in searchResults" :key="task.id" @click="selectTask(task)">
          <p>{{ task.task_name }} - {{ task.category }} - {{ task.priority }}</p>
        </li>
      </ul>
    </div>

    <!-- No Results Dropdown -->
    <div v-else-if="searchQuery.trim().length > 0" class="no-results-dropdown">
      <p>Aucun résultat trouvé pour "{{ searchQuery }}"</p>
    </div>



    <!-- Icons & Profile -->
    <div class="icons-and-profile d-flex">
      <!-- Notification Icon (visible only on medium and larger screens) -->
      <button class="icon-btn d-none d-md-block" @click="toggleNotifications">
        <i class="fas fa-bell"></i>
        <span v-if="showRedDot" class="red-dot"></span>
      </button>

      <div v-if="showNotifications" class="notification-dropdown">
        <div class="dropdown-header d-flex justify-content-between align-items-center">
          <h5>Notifications</h5>
          <button @click="toggleNotifications" class="close-btn">✖</button>
        </div>

        <div v-if="notifications.length > 0">
          <!-- Creative Notification Message -->
          <p class="notification-message">
            ⏰ Il vous reste moins d'une heure pour terminer 
            {{ notifications.length === 1 ? 'votre tâche' : 'vos tâches' }}. 
          </p>

          <!-- Display task notifications -->
          <ul class="notification-list">
            <li v-for="notif in notifications" :key="notif.id" class="notification-item" >
              <div class="task-info">
                <i class="fas fa-exclamation-circle"></i> <!-- Exclamation Icon -->

                <h6 @click="goToCategoryPage">{{ notif.title }} 
                </h6>
                <p class="notification-date">à {{ notif.dueTime }}</p>
              </div>
              <button @click="snoozeNotification(notif.id)" class="snooze-btn">Reporter</button>
            </li>
          </ul>

        </div>

        <!-- Display image if no notifications -->
        <div v-if="notifications.length === 0" class="no-notifications">
          <img :src="require('@/assets/noNotif.png')" alt="No Notifications" class="no-notif-img" />
          <p>Aucune nouvelle notification</p>
        </div>
      </div>

      <!-- Light/Dark Mode Icon -->
      <div class="icon-btn">
        <i 
          class="fas" 
          :class="darkMode ? 'fa-sun' : 'fa-moon'" 
          @click="toggleDarkMode"
          style="cursor: pointer; font-size: 20px;">
        </i>
      </div>

   

      <!-- Profile Section -->
      <div class="profile d-flex align-items-center">
        <router-link to="/profil" class="d-flex align-items-center text-decoration-none">
          <img
            :src="require('@/assets/user.jpg')"
            alt="User"
            class="profile-img"
          />
          <div class="profile-info">
            <span class="profile-name">{{ capitalizedName }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
import axios from "axios"; 
export default {
  name: "HeaderView",
  data() {
    return {
      searchQuery: "", // To store the input value
      searchResults: [], // To store the search results
      darkMode: false,
      userName: "",
      showNotifications: false,
      notifications: [], // Notification data
      showRedDot: false,
      tasksDueSoon: [],
      snoozedTasks: [] // Track snoozed tasks
    };
  },
  created() {
    axios
      .get("http://localhost:3000/api/user", { withCredentials: true })
      .then((response) => {
        this.userName = response.data.userName; // Set the user's name
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données utilisateur :", error);
      });

    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      this.darkMode = true;
      document.body.classList.add("dark-mode");
    }

    this.fetchNotifications(); // Fetch notifications on component load
    setInterval(this.fetchNotifications, 60000); // Poll every minute to check for new notifications
  },
  computed: {
    capitalizedName() {
      if (!this.userName) return "";
      return this.userName.charAt(0).toUpperCase() + this.userName.slice(1);
    },
  },
  methods: {
    handleSearch() {
      // Automatically fetch results when typing
      if (this.searchQuery.trim()) {
        this.fetchSearchResults();
      } else {
        this.searchResults = []; // Clear results if query is empty
      }
    },
    submitSearch() {
      // Explicitly fetch results when the "Go" button is clicked
      if (this.searchQuery.trim()) {
        this.fetchSearchResults();
      }
    },
    fetchSearchResults() {
  axios
    .get(`http://localhost:3000/api/search-tasks?q=${this.searchQuery}`, {
      withCredentials: true,
    })
    .then((response) => {
      if (response.data.hasTasks) {
        this.searchResults = response.data.tasks; // Make sure this is the correct structure
      } else {
        this.searchResults = [];
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la recherche :", error);
    });
},

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      if (this.darkMode) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "true");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "false");
      }
    },
    fetchNotifications() {
      axios
        .get("http://localhost:3000/api/tasks-due-soon", { withCredentials: true })
        .then((response) => {
          const { hasNotifications, tasks } = response.data;

          if (hasNotifications) {
            this.notifications = tasks.map((task) => {
              const dueDate = task.due_date ? task.due_date.split('T')[0] : 'No date';
              const dueTime = task.due_time ? task.due_time : 'No time';

              return {
                id: task.id,
                title: task.task_name,
                dueDate: dueDate,
                dueTime: dueTime,
                overdue: false,
              };
            });
          } else {
            this.notifications = [];
          }
          this.showRedDot = this.notifications.length > 0;
        })
        .catch((error) => {
          console.error("Error fetching notifications:", error);
        });
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
    },
    snoozeNotification(taskId) {
      // Mark the task as snoozed (remove from active notifications)
      const snoozedTask = this.notifications.find(task => task.id === taskId);
      if (snoozedTask) {
        this.snoozedTasks.push(snoozedTask);
        this.notifications = this.notifications.filter(task => task.id !== taskId);
        this.showRedDot = this.notifications.length > 0;

        // Re-add the task after a delay (e.g., 30 minutes)
        setTimeout(() => {
          this.notifications.push(snoozedTask);
          this.snoozedTasks = this.snoozedTasks.filter(task => task.id !== taskId);
        }, 1800000); // 30 minutes (1800000ms)
      }
    },
    goToCategoryPage(taskId) {
      this.showNotifications = false; // Close dropdown
      this.$router.push({ path: '/cat', query: { taskId: taskId } });
    },
    handleClickOutside(event) {
      // Ensure the dropdown exists and handle the click outside
      if (this.$refs.searchDropdown && this.$refs.searchBar && 
          !this.$refs.searchDropdown.contains(event.target) && 
          !this.$refs.searchBar.contains(event.target)) {
        this.searchResults = [];
        this.searchQuery = ''; // Optionally clear the search query
      }
    },
    selectTask(task) {
      this.$router.push({ path: '/cat', query: { taskId: task.id } });
      this.searchQuery = ""; // Clear the search query
      this.searchResults = []; // Clear the search results

},

  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },

};
</script>




<style scoped>

.header {
  display: flex;
  justify-content: space-between; /* Space between search bar and other elements */
  align-items: center; /* Center vertically */
  padding: 1rem;
  position: relative; /* Allows fine positioning */
  border: none;
}
.search-results {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  margin-top: 8px;
  padding: 10px;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.search-results h5 {
  margin: 0 0 10px;
}

.search-results ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-results li {
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.search-results li:hover {
  background: #f9f9f9;
}
.dark-mode .search-bar{
  background-color: #3f3f3f;
  border-radius: 20px;
}
.dark-mode .search-input{
  color: #c3c3c3;

}

/* Centered Search Bar */
.search-bar {
  display: flex;
  justify-content: flex-start;
  background-color: rgba(235, 234, 234, 0.708) ;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  position: relative;
  width: 50%;
  transition: 0.4s;
  margin-left: 400px;
}

/* Search Input */
.search-input {
  width: 100%;
  padding: 10px 50px;
  border: none;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.search-dropdown,
.no-results-dropdown {
  position: absolute;
  top: 100%; /* Positioned below the search bar */
  left: 0;
  width: 50%;
  background: white;
  border: 1px solid #ddd;
  margin-top: 8px;
  margin-left: 380px;
  border-radius: 25px;
  padding: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* Icons and Profile Section */
.icons-and-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto; /* Push to the right side */
}
.dark-mode .icon-btn {
  color:  hsl(268, 75%, 67%);
}
.dark-mode .profile-name{
  color:  hsl(268, 75%, 67%);
}
/* Icon Buttons */
.icon-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #240046;
  transition: transform 0.3s ease;
  position: relative;
}
.icon-btn:hover {
  color: #9d4edd;
    transform: translateY(-3px) scale(1.05);


}

/* Profile Section */
.profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto; /* Push the profile to the right side */
  text-decoration: none;


}

/* Profile Image */
.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
}



/* Profile Name */
.profile-name {
  font-weight: bold;
  color: #240046;
}

.search-bar button[type="submit"] {
  background-color: #3c096c;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 0;
  right: 0;
  transition: .9s ease;
}
.dark-mode .search-bar button[type="submit"]{
  color: rgb(255, 255, 255);
  background-color: hsl(268, 75%, 67%);
}
.dark-mode .search-bar button[type="submit"]:hover{
  color: rgb(255, 255, 255);
  background-color: hsl(269, 75%, 44%);
}
.search-bar button[type="submit"]:hover {
  transform: scale(1.1);
  color: rgb(255, 255, 255);
  background-color: hsl(268, 70%, 70%);
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-bar {
    left: 27%;
    width: 200px; /* Make search bar wider on small screens */
  }
  .profile {
    margin-left: 1rem; /* Less margin on smaller screens */
  }
}
.notification-dropdown {
  position: absolute;
  top: 60px;
  right: 90px;
  width: 500px;
  max-height: 350px; /* Set a max height for the dropdown */
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  z-index: 1000;
  padding: 15px;
  overflow-y: auto; /* Enable vertical scrolling when content overflows */
}

/* Styling the scrollbar */
.notification-dropdown::-webkit-scrollbar {
  width: 8px; /* Set the width of the scrollbar */
}

.notification-dropdown::-webkit-scrollbar-thumb {
  background-color: #888; /* Set the color of the thumb */
  border-radius: 10px; /* Round the corners of the thumb */
}

.notification-dropdown::-webkit-scrollbar-thumb:hover {
  background-color: #555; /* Darken the thumb when hovered */
}

.notification-dropdown::-webkit-scrollbar-track {
  background-color: #f1f1f1; /* Set the track color */
  border-radius: 10px; /* Round the corners of the track */
}



.notification-message {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #491784;
}

.notification-item h6 {
  display: inline-block;
  margin-right: 5px;
  font-weight: bold;
  color: #8967af;
}

.notification-item i {
  margin-right: 10px;
  color: #491784;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #636363;
  cursor: pointer;
  transition: transform 0.2s ease;
  
}

.notification-item:hover {
  background: #f9f9f9;
  transform: translateY(-3px) scale(1.05);

}

.notification-date {
  font-size: 0.8rem;
  color: #666;
}

.snooze-btn {
  background: none;
  border: none;
  color: #491784;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}




.dark-mode .notification-dropdown {
  background: #2e2e2e;
  color: #c3c3c3;
}


.dropdown-header {
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
}

.notification-list {
  list-style: none;
  padding: 0;
  margin: 0;
}



.has-notifications {
  position: relative;
}

.has-notifications::after {
  content: '';
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
}
.dark-mode .notification-item:hover {
  background: #454545;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #333;
}

.dark-mode .close-btn {
  color: #c3c3c3;
}

.red-dot {
  position: absolute; 
  top: -5px; 
  right: -5px; 
  width: 10px; 
  height: 10px; 
  border-radius: 50%;
  background-color: red; 
  border: 2px solid white; 
}

.no-notifications {
  text-align: center;
  padding: 20px;
}

.no-notif-img {
  max-width: 100%;  /* Adjusts image size to fit container */
  max-height: 150px; /* Limits the height of the image */
  margin-bottom: 10px;
}


.search-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.search-dropdown li {
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.search-dropdown li:hover {
  background: #f9f9f9;
}

.no-results-dropdown {
  text-align: center;
  font-size: 0.9rem;
  color: #555;
}
.search-dropdown-right {
  left: auto; /* Reset the default alignment */
  right: 0; /* Align to the right */
}


.search-dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.search-dropdown li {
  padding: 8px;
  cursor: pointer;
}

.search-dropdown li:hover {
  background-color: #f0f0f0;
}

.no-results {
  padding: 8px;
  color: #888;
}



</style>
