<template>
  
    <div class="profil_page">
   <div class="layout"> 
     <!-- Colonne droite (Profil) -->
    <div class="right-column">
      <div class="profile-section">
        <h2 class="heading">Mon Profil</h2>
        <div class="profile-photo-section">
          <img :src="require('@/assets/user.jpg')" alt="Photo de profil" class="profile-photo" />
        </div>
        <form @submit.prevent="saveChanges" class="form">
          <div v-if="!isEditing">
  <p class="form-field">
    <span class="label">Prénom :</span> <span class="value">{{ profile.name }}</span>
  </p>
  <p class="form-field">
    <span class="label">Nom :</span> <span class="value">{{ profile.surname }}</span>
  </p>
  <p class="form-field">
    <span class="label">Email :</span> <span class="value">{{ profile.email }}</span>
  </p>
  <p class="form-field">
    <span class="label">Mot de passe :</span> <span class="value">********</span>
  </p>
  <button type="button" @click="isEditing = true" class="login-button">Modifier</button>
  </div>

          <div v-if="isEditing">
            <input type="text" v-model="profile.name" placeholder="Changer le prénom" class="input" />
            <input type="text" v-model="profile.surname" placeholder="Changer le nom" class="input" />
            <input type="email" v-model="profile.email" placeholder="Changer l'email" class="input" />
            <input type="password" v-model="profile.password" placeholder="Changer le mot de passe" class="input" />
            <button type="submit" class="login-button">Enregistrer les changements</button>
            <button type="button" @click="isEditing = false" class="login-button cancel-button">Annuler</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Colonne gauche -->
    <div class="left-column">
      <div class="cards-container">
          <StatCard
            title="Total des tâches"
            style="background-color:#240046;"
            endpoint="http://localhost:3000/api/tasks/count"
          />
          <StatCard
            title="Achèvement Total"
            style="background-color:#3c096c;"
            endpoint="http://localhost:3000/api/tasks/completed-percentage-total"
          />
          <StatCard
            title="Échecs "
            style="background-color:#5a189a;"
            endpoint="http://localhost:3000/api/tasks/canceled-percentage-total"
          />
        </div>
      <div class="charts-section">
          <div class="first-row">
            <div class="pie">
              <PieChart :statistics="taskStatistics" />
            </div>
            <div class="bar">
              <CategoryBarChart :chartData="categoryData" />
            </div>
          </div>

          <!-- Deuxième ligne (Ligne graphique) -->
          <div class="line">
            <LineChart :chartData="weeklyData || []" />
          </div>
        </div>

      
        
      </div>
 

  



  </div>
</div>
 

</template>

<script>
import axios from "axios";
import PieChart from "@/components/charts/PieChart.vue";
import LineChart from "@/components/charts/LineChart.vue"; // Import the LineChart
import CategoryBarChart from "@/components/charts/CategoryBarChart.vue"; // Import the CategoryBarChart
import StatCard from "@/components/charts/StatCard.vue";

export default {
  components: {
    PieChart,
    LineChart,
    CategoryBarChart, 
    StatCard,
    

  },
  data() {
    return {
      isEditing: false,
      profile: {
        name: "",
        surname: "",
        email: "",
        password: "",
      },
      taskStatistics: [], // For holding statistics data
      weeklyData: [], // For holding weekly task data
      categoryData: [], // For holding category statistics data
   
       
    };
  },
  methods: {
    async fetchProfileData() {
      try {
        const response = await axios.get("http://localhost:3000/profile", { withCredentials: true });
        const data = response.data || {};
        this.profile.name = data.name || "Nom non défini";
        this.profile.surname = data.surname || "Prénom non défini";
        this.profile.email = data.email || "Email non défini";
      } catch (error) {
        console.error("Erreur lors du chargement des données du profil :", error);
      }
    },
    async fetchStatistics() {
      try {
        const response = await axios.get("http://localhost:3000/api/statistiques", { withCredentials: true });
        this.taskStatistics = response.data || [];
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques :", error);
      }
    },
    async fetchWeeklyData() {
  try {
    const response = await axios.get("http://localhost:3000/api/statistiques/weekly-completed");
    this.weeklyData = response.data; // Récupère les données de la semaine
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
  }
},
    async fetchCategoryData() {
      try {
        const response = await axios.get("http://localhost:3000/api/statistiques/categories");
        this.categoryData = response.data || [];
      } catch (error) {
        console.error("Erreur lors de la récupération des données de catégories:", error);
      }
    },
    
    async saveChanges() {
      const updatedProfile = {
        name: this.profile.name,
        surname: this.profile.surname,
        email: this.profile.email,
        password: this.profile.password,
      };
      try {
        await axios.put("http://localhost:3000/profile", updatedProfile, { withCredentials: true });
        alert("Les changements ont été enregistrés !");
      } catch (error) {
        console.error("Erreur lors de l'enregistrement :", error);
      }
    },
  },
  mounted() {
    this.fetchProfileData();
    this.fetchStatistics();
    this.fetchWeeklyData();
    this.fetchCategoryData(); 
    
  },
};
</script>


<style scoped>


.dark-mode .container,
.dark-mode .container2 {
  background-color:rgb(55, 54, 56);
  color:rgba(209, 209, 209, 0.858) ;
  box-shadow: 5px 18px 22px rgba(0, 0, 0, 0.324);
  border:none;
}

.dark-mode .input {
  background:rgb(108, 108, 108);
  color:  rgba(209, 209, 209, 0.858) ;
  box-shadow: 5px 18px 22px rgba(0, 0, 0, 0.324);
}


.dark-mode .circle {
  background: conic-gradient(
    #bb86fc calc(  rgba(209, 209, 209, 0.858) * 1%),
    #444 0%
  );
}
.dark-mode .heading{
  color:hsl(268, 75%, 67%);
}

.first-row {
  display: flex;
  justify-content: space-between; 
  align-items: center;
  gap: 20px; 
}

.bar {
  flex: 1; 
  max-width: 50%;
  background: #fff;
  border-radius: 20px;
  padding: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}
.pie{
  flex: 1; 
  max-width: 30%;
  background: #fff;
  border-radius: 20px;
  padding: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  margin-left: 200px;
}
.line {
  background: #fff;
  border-radius: 20px;
  width: 75%;
  border-radius: 20px;
  padding: 20px;
  margin-left: 200px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}


.profil_page {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color:rgba(235, 234, 234, 0.708) ;
}

.layout {
  display: flex;
  flex-direction: row;
  width: 100%;

}

.left-column {
  flex: 3; /* La colonne gauche prend plus d'espace */
  display: flex;
  flex-direction: column;
  gap: 10px; 
  
}

.right-column {
  flex: 1; /* La colonne droite est plus petite */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  
  
}
.stat-card {
  flex: 1;
  min-width: 150px; /* Assure des dimensions égales */
}
.cards-container {
  display: flex;
  flex-direction: row;
  display: flex;
  flex-wrap: wrap;
  width: 90%;
  margin-left:210px;
  margin-bottom: 20px;
  margin-top: 50px;
  gap: 30px;
}

.charts-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-section {
  background: #fff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  margin-left: 230px;
  margin-top: 45px;
  width: 100%;
}

.profile-section {
  max-width: 380px;
}
.heading {
margin-top: 10px;
  text-align: center;
  font-weight:700;
  font-size: 30px;
  color: #3c096c;
}

.profile-photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom:30px;
}

.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
 
}
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #240046; 
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: auto;
  margin-bottom: 50px;
}.form-field {
  display: flex;
  justify-content: space-between; /* Space between label and value */
  margin-bottom: 10px; /* Add space between each field */
}

.form-field .label {
  font-weight: 600;
  font-size: 18px;
  color: #fff; 
  flex: 1; 
}

.form-field .value {
  font-size: 20px;
  font-weight: 500;
  color: #fff; 
  flex: 1; 
  text-align: left; 
}

.input {
  width: 100%;
  background: rgb(255, 255, 255);
  color: rgba(77, 76, 76, 0.858);
  border: none;
  padding: 10px 15px;
  border-radius: 15px;
  margin-top: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.input:focus {
  outline: none;
  border-inline: 2px solid #bf78f8;
  color: #444;
  background-color: #cccccc;
}

.login-button, .cancel-button {
  width: 100%;
  background:#9d4edd;
  color: white;
  padding: 12px;
  border-radius: 15px;
  margin-top: 15px;
  font-weight: bold;
  text-align: center;
  transition: 0.3s ease;
}
.login-button:hover{
  background:#9d4edd;
  transform: translateY(-3px) scale(1.05);
}
.cancel-button:hover{
  background: #989898;
  transform: translateY(-3px) scale(1.05);
}
.cancel-button {
  background: #ccc;
  color: rgb(32, 32, 32);
}

.charts-section > * {
  flex: 1 1 45%;
 padding-right:80px ;
}


/* Ensuring the chart section does not break layout */
.linechart-section {
  margin-top: 30px;
  margin-left: 330px;
  margin-bottom: 50px;
}
.linechart-section {
  flex: 1;

}
.linechart-section h2 {
  text-align: center;
  font-size: 24px;
  color: rgb(82, 26, 122);
  margin-bottom: 20px;
}
.category-bar-chart h2 {
  text-align: center;
  font-size: 24px;
  color: rgb(82, 26, 122);
  margin-bottom: 20px;
}

.priorite{
  width:60%;
  margin:400px ;
}

/* Media Query for Tablets */
@media (max-width: 1024px) {
  .layout {
    flex-direction: column;
  }

  .left-column,
  .right-column {
    flex: 1 1 100%; /* Full width */
  }



  .stat-card {
    flex: 1 1 calc(50% - 10px); /* 2 cards per row */
  }

  .pie,
  .bar,
  .line {
    max-width: 100%;
  }

  .profile-photo {
    width: 120px;
    height: 120px;
  }
}

/* Media Query for Mobile Devices */
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
    align-items: center;
  }

  .cards-container {
    flex-direction: column;
    
    gap: 10px;
  }

  .stat-card {
    flex: 1 1 100%; /* Single column */
  }

  .profile-section {
    max-width: 100%;
    width: 400px;
    margin-left: 30px ;
  }

  .profile-photo {
    width: 80px;
    height: 80px;
  }

  .form {
    max-width: 100%;
    padding: 10px;
  }

  .heading {
    font-size: 20px;
  }
  .first-row{
    flex-direction: column;
    
  }
  .pie {
    width: 70%;

  }
  .bar {
    width: 70%;
    margin-left:200px;
  }
  .line{
    width: 60%;
    
  }
}

/* Typography for Small Devices */
@media (max-width: 480px) {
  .form-field .label,
  .form-field .value {
    font-size: 14px;
  }

  .login-button {
    font-size: 14px;
    padding: 10px;
  }
}
</style>