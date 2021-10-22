<template>
  <div class="pixelize">
    <h1>Pixelize!!!</h1>
    <p>
      画像をドット絵に変換します。
      <br />好きな画像ファイルを選択してから「Pixelize!!!」をクリックしてください。
    </p>
    <div>
      <label>
        <input type="file" v-on:change="upload" accept="image/*" />
      </label>
    </div>

    <p>オリジナル画像の幅：{{ widthBefore }}</p>
    <p>オリジナル画像の高さ：{{ heightBefore }}</p>
    <div>
      <h2>変換前プレビュー</h2>
      <canvas id="preview-before"></canvas>
    </div>
    <div>
      <h2>変換</h2>
      <form v-on:submit.prevent="toPixel">
        <p>
          <label>
            色の数（1～100）
            <input type="number" min="1" max="100" v-model="colors" />
          </label>
        </p>
        <p>
          <label>
            変更後の幅（1～1000）
            <input type="number" step="1" min="1" max="1000" v-model="widthAfter" />
          </label>
        </p>
        <p>
          <label>
            ピクセルの大きさ（3～30）
            <input type="number" min="3" max="30" v-model="pixelSize" />
          </label>
        </p>
        <p>
          <label>
            グリッド線をつける
            <input type="checkbox" v-model="grid" />
          </label>
        </p>
        <p>
          <button type="submit">Pixelize!!!</button>
        </p>
      </form>
      <canvas id="preview-after"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: "Pixelize",
  data() {
    return {
      widthBefore: null,
      heightBefore: null,
      widthAfter: 100,
      heightAfter: null,
      colors: 3,
      pixelSize: 10,
      grid: true,
      img: null,
    };
  },
  methods: {
    upload: function (event) {
      let img = null;
      let file = event.target.files;
      if (file.length == 0) {
        return;
      }
      let reader = new FileReader();
      reader.readAsDataURL(file[0]);
      // ファイルを読み込んだときの処理
      reader.onload = function () {
        img = new Image();
        // 画像が読み込まれたときの処理（canvasに描画）
        img.onload = function () {
          let canvas = document.getElementById("preview-before");
          if (canvas.getContext) {
            // canvas 2d contextが使える前提
            let context = canvas.getContext("2d");
            this.widthBefore = img.width;
            this.heightBefore = img.height;
            canvas.width = this.widthBefore;
            canvas.height = this.heightBefore;
            context.drawImage(img, 0, 0);
            this.img = img;
          }
        }.bind(this);
        img.src = reader.result;
      }.bind(this);
    },
    toPixel: function () {
      let canvas = document.getElementById("preview-after");
      if (canvas.getContext && this.img != null) {
        let context = canvas.getContext("2d");
        let scale = this.widthAfter / this.widthBefore;
        this.heightAfter = this.heightBefore * scale;
        canvas.width = this.widthBefore * scale;
        canvas.height = this.heightBefore * scale;
        context.scale(scale, scale);
        context.drawImage(this.img, 0, 0);
        let srcData = context.getImageData(0, 0, canvas.width, canvas.height);
        let dstData = context.createImageData(canvas.width, canvas.height);
        let src = srcData.data;
        let dst = dstData.data;
        kMeansFilter(src, dst, canvas.width, canvas.height, this.colors);
        canvas.width *= this.pixelSize;
        canvas.height *= this.pixelSize;
        let outputImageData = visualizePixel(
          dstData,
          this.pixelSize,
          this.grid
        );
        context.putImageData(outputImageData, 0, 0);
      }
    },
  },
};
// クラスタリング
const kMeansFilter = (src, dst, width, height, colors) => {
  const vmax = 255; // 配列要素の最大値
  const loopMax = 100; // ループ処理の最大回数
  // 初期化
  colors = parseInt(colors);
  let centroids = Array(colors); // 各クラスタ中心を保持
  for (var c = 0; c < colors; c++) {
    var rand_i = Math.floor(Math.random() * height);
    var rand_j = Math.floor(Math.random() * width);
    centroids[c] = src.slice(
      (rand_j + rand_i * width) * 4,
      (rand_j + rand_i * width) * 4 + 3
    );
  }
  let clsts = Array(width * height); // 各画素の所属クラスタラベル（0～colors-1）を保持
  let clstsSum = Array(colors); // 各クラスタの重心計算用
  for (var c = 0; c < colors; c++) {
    clstsSum[c] = Array(3);
  }
  let clstsSize = Array(colors); // 各クラスタの重心計算用
  let count = 0;
  // メイン処理
  let clstsPrev = JSON.parse(JSON.stringify(clsts));
  let exitFlg = false;
  while (true) {
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        var vec = src.slice((j + i * width) * 4, (j + i * width) * 4 + 3);
        var minDist = calcDistance(vec, centroids[0]);
        var minClst = 0;
        for (var c = 1; c < colors; c++) {
          var nextDist = calcDistance(vec, centroids[c]);
          if (nextDist < minDist) {
            minDist = nextDist;
            minClst = c;
          }
        }
        clsts[j + i * width] = minClst;
      }
    }
    // update centroids
    clstsSize.fill(0);
    for (var c = 0; c < colors; c++) {
      clstsSum[c].fill(0);
    }
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        var clst = clsts[j + i * width];
        for (var k = 0; k < 3; k++) {
          clstsSum[clst][k] += src[(j + i * width) * 4 + k];
        }
        clstsSize[clst] = clstsSize[clst] + 1;
      }
    }
    for (var c = 0; c < colors; c++) {
      for (var k = 0; k < 3; k++) {
        centroids[c][k] =
          clstsSize[c] > 0 ? Math.floor(clstsSum[c][k] / clstsSize[c]) : 0;
      }
    }
    exitFlg =
      JSON.stringify(clsts) === JSON.stringify(clstsPrev) || count > loopMax;
    if (exitFlg) {
      break;
    }
    clstsPrev = JSON.parse(JSON.stringify(clsts));
    count++;
  }
  // クラスタリング結果を反映
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      var clst = clsts[j + i * width];
      for (var k = 0; k < 3; k++) {
        dst[(j + i * width) * 4 + k] = centroids[clst][k];
        // 透明度は維持
        dst[(j + i * width) * 4 + 3] = src[(j + i * width) * 4 + 3];
      }
    }
  }
};
// ベクトル間距離
const calcDistance = (vec1, vec2) => {
  let dist = 0;
  for (var i = 0; i < vec1.length; i++) {
    dist += Math.pow(Math.abs(vec2[i] - vec1[i]), 2);
  }
  dist = Math.sqrt(dist);
  return dist;
};
// ドット絵を見やすくする（拡大、グリッド線）
const visualizePixel = (inputImageData, pixelSize, grid) => {
  const vmax = 255; // 配列要素の最大値
  const gridStep = 10; // グリッド線をgridStepごとに太くする
  const newWidth = inputImageData.width * pixelSize;
  const newHeight = inputImageData.height * pixelSize;
  const outputImageData = new ImageData(
    inputImageData.width * pixelSize,
    inputImageData.height * pixelSize
  );
  // 拡大
  for (var i = 0; i < newHeight; i++) {
    for (var j = 0; j < newWidth; j++) {
      var iOld = Math.floor(i / pixelSize);
      var jOld = Math.floor(j / pixelSize);
      for (var k = 0; k < 4; k++) {
        outputImageData.data[(j + i * newWidth) * 4 + k] =
          inputImageData.data[(jOld + iOld * inputImageData.width) * 4 + k];
      }
    }
  }
  // グリッド線
  if (grid) {
    for (var i = 0; i < newHeight; i++) {
      for (var j = 0; j < newWidth; j++) {
        if (
          i % pixelSize == 0 ||
          j % pixelSize == 0 ||
          (i + 1) % (pixelSize * gridStep) == 0 ||
          (j + 1) % (pixelSize * gridStep) == 0
        ) {
          for (var k = 0; k < 3; k++) {
            outputImageData.data[(j + i * newWidth) * 4 + k] = vmax;
          }
          outputImageData.data[(j + i * newWidth) * 4 + k] = vmax;
        }
      }
    }
  }
  return outputImageData;
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: #42b983;
}
</style>
