<template>
  <div>
    <ul v-for="(lesson, index) in timetable" :key="index">
      <li>
        <p>
          {{ lesson.title }}
        </p>
        <p>
          {{ lesson.id }}
        </p>
        <p>
          {{ lesson.password }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { PropType } from "vue";

type Timetable = {
  id: string;
  title: string;
  password: string;
};

export default {
  props: {
    timetable: {
      type: Object as PropType<Timetable[]>,
      required: true,
    },
  },

  setup(props, context) {},
};
</script>

<style lang="scss" scoped></style>
