<script lang="tsx">
type ToDo = {
  done: boolean;
  title: string;
};

export default defineComponent({
  setup(props) {
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

    return () => (
      <>
        <div class="head">
          <h1 class="hoge">hge</h1>
        </div>
        <p>{JSON.stringify(todos.value)}</p>
      </>
    );
  },
});
</script>

<style lang="scss" scoped>
.head {
  .hoge {
    color: #f00;
  }
}
</style>
