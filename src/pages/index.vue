<script lang="tsx">
import PixelizeVue from "../components/Pixelize.vue";

export default defineComponent({
  setup() {
    return () => (
      <>
        <div class="hoge">
          <PixelizeVue />
        </div>
      </>
    );
  },
});
</script>

<style lang="scss" scoped></style>
