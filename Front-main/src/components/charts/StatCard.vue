<template>
  <div class="card_each">
    <h3>{{ title }}</h3>
    <p>{{ data }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: ['title', 'endpoint'], // 'endpoint' pour l'URL de la route backend
  data() {
    return {
      data: 0, // Valeur initiale
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      axios
        .get(this.endpoint)
        .then((response) => {
          this.data = Object.values(response.data)[0]; // Récupérer la valeur de l'objet renvoyé
        })
        .catch((error) => {
          console.error('Erreur de récupération des données:', error);
        });
    },
  },
};
</script>

<style scoped>
.card_each {
  width: 250px;
  height: 150px;
  border-radius: 10px;

  color: #fff;
  text-align: left; /* Alignement du texte */
  padding: 20px; /* Espacement intérieur */
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

h3 {
  margin: 0;
  font-size: 1.2rem; 
  letter-spacing: 1px; 
  font-weight:600;
  color: #fff; 
}

p {
  margin: 10px 0 0; 
  font-size: 3rem; 
  font-weight:600; 
  color: #ffffff; 
}

.card_each:hover {
  transform: scale(1.05);
  box-shadow: 0px 15px 25px rgba(0, 0, 0, 0.3);
}

</style>
