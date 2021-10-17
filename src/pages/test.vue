<template>
  <div>
    <ul>
      <li v-for="(todo, index) in todos" :key="index">
        <input type="checkbox" v-model="todo.done" />
        <span>{{ todo.title }}</span>
        <button @click="remove(index)">REMOVE</button>
      </li>
    </ul>
    <input type="text" v-model="newToDoTitle" />
    <button @click="add">ADD</button>
    <test-component />
  </div>
</template>

<script lang="ts">
type ToDo = {
  done: boolean;
  title: string;
};

export default defineComponent({
  head: {
    title: "My Page",
  },

  setup() {
    const todos = ref<ToDo[]>([
      {
        done: false,
        title: "これはやることです",
      },
      {
        done: true,
        title: "二つ目のやること",
      },
      {
        done: false,
        title: "三つ目のやること",
      },
    ]);
    const newToDoTitle = ref<string>("");
    const add = () => {
      todos.value.push({
        done: false,
        title: newToDoTitle.value,
      });
      newToDoTitle.value = "";
    };
    const remove = (index: number) => {
      todos.value.splice(index, 1);
    };

    return {
      todos,
      newToDoTitle,
      add,
      remove,
    };
  },
});
</script>
