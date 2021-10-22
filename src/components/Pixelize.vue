<script lang="tsx">
import Pixelize from "../utils/PixelizeUtil";

export default defineComponent({
  head: {
    title: "ドットえぇ〜",
  },

  setup(props) {
    const widthBefore = ref<number | null>(null);
    const heightBefore = ref<number | null>(null);
    const widthAfter = ref<number>(100);
    const heightAfter = ref<number>(null);
    const colors = ref<number>(100);
    const pixelSize = ref<number>(15);
    const grid = ref<boolean>(false);
    const image = ref<CanvasImageSource | null>(null);
    const imageUrl = ref<string>("");

    const upload = (event: Event) => {
      let img = null;
      let file = (event.target as HTMLInputElement).files;

      if (file.length == 0) return;

      let reader = new FileReader();
      reader.readAsDataURL(file[0]);

      // ファイルを読み込んだときの処理
      reader.onload = function () {
        img = new Image();
        // 画像が読み込まれたときの処理（canvasに描画）
        img.onload = function () {
          let canvas = document.getElementById(
            "preview-before"
          ) as HTMLCanvasElement;

          if (canvas.getContext) {
            // canvas 2d contextが使える前提
            let context = canvas.getContext("2d");
            widthBefore.value = img.width;
            heightBefore.value = img.height;

            canvas.width = widthBefore.value;
            canvas.height = heightBefore.value;
            context.drawImage(img, 0, 0);

            image.value = img;
          }
        }.bind(this);

        img.src = reader.result;
      }.bind(this);
    };

    const toPixel = (e: Event) => {
      let canvas = document.getElementById(
        "preview-after"
      ) as HTMLCanvasElement;

      if (canvas.getContext && image.value != null) {
        let context = canvas.getContext("2d");
        let scale = widthAfter.value / widthBefore.value;
        heightAfter.value = heightBefore.value * scale;

        canvas.width = widthBefore.value * scale;
        canvas.height = heightBefore.value * scale;
        context.scale(scale, scale);
        context.drawImage(image.value, 0, 0);

        let srcData = context.getImageData(0, 0, canvas.width, canvas.height);
        let dstData = context.createImageData(canvas.width, canvas.height);
        let src = srcData.data;
        let dst = dstData.data;

        Pixelize.kMeansFilter(
          src,
          dst,
          canvas.width,
          canvas.height,
          colors.value
        );

        canvas.width *= pixelSize.value;
        canvas.height *= pixelSize.value;

        let outputImageData = Pixelize.visualizePixel(
          dstData,
          pixelSize.value,
          grid.value
        );

        context.putImageData(outputImageData, 0, 0);

        imageUrl.value = URL.createObjectURL(
          Pixelize.dataURLtoBlob(context.canvas.toDataURL())
        );
      }

      e.preventDefault();
    };

    return () => (
      <>
        <div class="pixelize">
          <h1>Pixelize!!!</h1>
          <p>
            画像をドット絵に変換します。
            <br />
            好きな画像ファイルを選択してから「Pixelize!!!」をクリックしてください。
          </p>
          <div>
            <label>
              <input type="file" onChange={upload} accept="image/*" />
            </label>
          </div>

          <p>オリジナル画像の幅：{widthBefore.value}</p>
          <p>オリジナル画像の高さ：{heightBefore.value}</p>

          <div>
            <h2>変換前プレビュー</h2>
            <canvas id="preview-before"></canvas>
          </div>

          <div>
            <h2>変換</h2>
            <form onSubmit={toPixel}>
              <p>
                <label>
                  色の数（1～100）
                  <input
                    type="number"
                    min="1"
                    max="100"
                    v-model={colors.value}
                  />
                </label>
              </p>

              <p>
                <label>
                  変更後の幅（1～1000）
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="1000"
                    v-model={widthAfter.value}
                  />
                </label>
              </p>

              <p>
                <label>
                  ピクセルの大きさ（3～30）
                  <input
                    type="number"
                    min="3"
                    max="30"
                    v-model={pixelSize.value}
                  />
                </label>
              </p>

              <p>
                <label>
                  グリッド線をつける
                  <input type="checkbox" v-model={grid.value} />
                </label>
              </p>

              <p>
                <button type="submit">Pixelize!!!</button>
              </p>
            </form>

            {imageUrl.value && (
              <>
                <a href={imageUrl.value} target="_blank">
                  {imageUrl.value}
                </a>
              </>
            )}

            <canvas id="preview-after"></canvas>
          </div>
        </div>
      </>
    );
  },
});
</script>

<style scoped lang="scss">
h1 {
  color: #42b983;
}
</style>
