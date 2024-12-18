<template>
  <div class="task-display d-flex justify-content-between align-items-center" :style="getPriorityStyle(task.priority)">
    <div class="d-flex align-items-center">
      <!-- Custom Checkbox -->
      <label v-if="showCheckbox" class="custom-checkbox">
        <input
          type="checkbox"
          class="task-checkbox"
          :checked="task.completed"
          @change="markTaskCompleted"
        />
        <span class="checkmark"></span>
      </label>

      <!-- Category Icon + Task Details -->
      <div>
        <p class="task-name mb-0" :class="{ 'text-decoration-line-through': task.completed }">
          <!-- Icon Before Task Name -->
          <i :class="getCategoryIcon(task.category)" class="me-2" @click="goToCategory"></i>
          {{ task?.task_name || "Nom de la tâche non disponible" }}
        </p>
        <small
          class="task-date"
          :class="{ 'text-decoration-line-through': task.completed, 'text-danger': isOverdue }"
        >
          {{ task.due_time }}
        </small>
      </div>
    </div>

    
  </div>
</template>


<script>
import axios from 'axios';
axios.defaults.withCredentials = true;

export default {
  name: "TaskDisplay",
  props: {
    task: {
      type: Object,
      required: true,
    },
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    showTooltip: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    isOverdue() {
      if (!this.task.due_date) return false;
      const currentDateTime = new Date();
      const dueDateTime = new Date(this.task.due_date);
      if (this.task.due_time) {
        const [hours, minutes] = this.task.due_time.split(":").map(Number);
        dueDateTime.setHours(hours, minutes, 0, 0);
      } else {
        dueDateTime.setHours(23, 59, 59, 999);
      }
      return dueDateTime < currentDateTime && !this.task.completed;
    },
  },
  methods: {
    getCategoryIcon(category) {
      const categoryIcons = {
        etude: "fas fa-book",
        travail: "fas fa-briefcase",
        maison: "fas fa-home",
        personnel: "fas fa-user",
        loisirs: "fas fa-gamepad",
        autre: "fas fa-cogs",
      };

      // Return the matching icon or a fallback icon
      return categoryIcons[category] || "fas fa-tag";
    },
    formatTaskDateTime(date, time) {
      if (!date) return "";
      const taskDate = new Date(date);
      const optionsDate = { year: "numeric", month: "long", day: "numeric" };
      const formattedDate = taskDate.toLocaleDateString("fr-FR", optionsDate);
      if (time) {
        const [hours, minutes] = time.split(":");
        const formattedTime = `${hours}:${minutes}`;
        return `${formattedDate}, ${formattedTime}`;
      }
      return formattedDate;
    },
    getPriorityStyle(priority) {
      const colors = {
        urgent: "rgba(255, 0, 0, 0.5)",
        important: "rgba(255, 165, 0, 0.5)",
        "moins important": "rgba(0, 128, 0, 0.5)",
      };
      return {
        boxShadow: `0px 4px 8px ${colors[priority?.toLowerCase()] || "gray"}`,
      };
    },
    triggerEditTask() {
      this.$emit("trigger-edit", this.task);
    },
    
 

goToCategory() {
      this.$router.push("/cat");
    },
},


  mounted() {
    this.$nextTick(() => {
      console.log("TaskDisplay component is mounted and ready");
    });
  },
};
</script>



<style scoped>
.task-display {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.8rem;
  margin-bottom: 1rem;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: #10002b;
}

.task-display:hover {
  transform: translateY(-3px);
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.15);
}


/* Task Date Styles */
.task-date {
  color: #333;
}

.task-date.text-danger {
  color: red; /* Red color for overdue tasks */
}



i{
    cursor: pointer;
    color: #10002b;
}


</style>