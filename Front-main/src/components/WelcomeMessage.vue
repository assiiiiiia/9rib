<template>
  <div class="container-fluid d-flex align-items-center justify-content-center mt-4">

    <div class="welcome-text" :class="{ 'animate-fall': animate }">
      <h1 class="display-4">{{ greeting }} {{ capitalizedName }}</h1>
      <p class="text">Ajoutez vos tâches et commencez à voir votre progression.!</p>
    </div>

    <div class="illustration" :class="{ 'animate-fall': animate }">
      <img :src="require('@/assets/heyy.png')" alt="Welcome Illustration" class="img-fluid" />
    </div>
  </div>
</template>


<script>
import axios from "axios"; 
axios.defaults.withCredentials = true;

export default {
  data() {
    return {
      userName: "",
      animate: false, 
      greeting: "", 
    };
  },
  computed: {
    capitalizedName() {
      if (!this.userName) return "";
      return this.userName.charAt(0).toUpperCase() + this.userName.slice(1);
    },
  },
  mounted() {
    // comparer l'heure pour afficher le message
    const currentHour = new Date().getHours();
    this.greeting = currentHour >= 18 ? 'Bonsoir' : 'Bonjour';

  //recuperer le username
    axios
      .get("http://localhost:3000/api/user", { withCredentials: true })
      .then((response) => {
        if (response.data.userName) {
          this.userName = response.data.userName; 
          this.animate = true; 
        } else {
          console.error("User not authenticated");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  },
};
</script>



<style scoped>
@keyframes fall {
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  50% {
    transform: translateY(10px);
    opacity: 0.5;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fall {
  animation: fall 1.3s ease-out;
}

.container-fluid {
  background: linear-gradient(70deg, 
    #10002b,   /* Couleur 1 */
    #240046,   /* Couleur 2 */
    #3c096c,   /* Couleur 3 */
    #5a189a,   /* Couleur 4 */
    #7b2cbf,   /* Couleur 5 */
    #9d4edd,   /* Couleur 6 */
    #c77dff,   /* Couleur 7 */
    #e0aaff    /* Couleur 8 */
  );
  background-size: 200% 200%;
  padding: 0;
  max-width: 80%;
  height: 180px;
  margin-left: 280px;
  margin-bottom: 26px;
  border-radius: 30px;
  box-shadow: 5px 18px 22px rgba(194, 38, 38, 0.1);
}

.dark-mode .container-fluid {
  background: rgb(55, 54, 56);
  box-shadow: 5px 18px 22px rgba(0, 0, 0, 0.324);
}
.dark-mode .display-4 {
  color: hsl(268, 75%, 67%);
}
.dark-mode p {
  color: #d1d1d1db;
}
.welcome-text {
  max-width: 70%;
  text-align: start;
  padding-right: 300px;
}

.display-4 {
  color: #fff;
  font-weight: bold;
}

.illustration {
  max-width: 350px;
}

.illustration img {
  max-width: 70%;
  object-fit: contain;
  margin-left: 100px;
}

h1 {
  font-size: 3rem;
}

.text {
  font-size: 1.25rem;
  font-weight: 400;
  color: #ffffff84;
}
@media (max-width: 1200px) {
  .container-fluid {
    max-width: 90%;
    margin-left: 150px;
  }

  .welcome-text {
    max-width: 80%;
    padding-right: 200px;
  }

  h1 {
    font-size: 2.5rem;
  }

  p {
    font-size: 1.2rem;
  }




  .welcome-text {
    padding-right: 0;
    text-align: center;
  }

  h1 {
    font-size: 3rem;
  }

  p {
    font-size: 1rem;
  }

  .illustration {
    max-width: 120px;
  }
}
@media (max-width: 1024px) {
  .task-overview {
    width: 90%;
    margin: 20px auto; /* Centre horizontalement */
    padding: 0;
    text-align: center;
    position: relative;
  }

  .task-count {
    font-size: 1.1rem;
  }

  .bell-icon,
  .close-btn {
    font-size: 1.6rem;
  }

  .task-overview {
    padding: 0;
    display: flex;
    flex-direction: column; 
    align-items: center; 
  }

  .task-count {
    font-size: 1rem;
  }

  .bell-icon,
  .close-btn {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .welcome-text,
  .task-overview {
    width: 90%;
    margin: 10px auto; 
    text-align: center;
    
  }

  .task-count {
    font-size: 0.9rem;
  }

  .bell-icon,
  .close-btn {
    font-size: 1.2rem;
  }
}

</style>