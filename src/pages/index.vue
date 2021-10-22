<script lang="tsx">
import PixelizeVue from "../components/Pixelize.vue";

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

    // return {
    //   todos,
    //   newToDoTitle,
    //   add,
    //   remove,
    // };
    return () => (
      <>
        <div class="hoge">
          <h1>ホゲ</h1>
          <week-timetable-card-component
            timetable={[
              {
                title: "ほげ",
                id: "123123",
                password: "321321",
              },
            ]}
          />
          <test-component />
          <PixelizeVue />
        </div>
      </>
    );
  },
});
</script>

<style lang="scss" scoped>
.hoge {
  h1 {
    color: #f00;
  }
}
</style>
