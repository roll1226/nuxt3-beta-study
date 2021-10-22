export default class Pixelize {
  /**
   *クラスタリング
   *
   * @static
   * @param {Uint8ClampedArray} src
   * @param {Uint8ClampedArray} dst
   * @param {number} width
   * @param {number} height
   * @param {number} colors
   * @memberof Pixelize
   */
  public static kMeansFilter(
    src: Uint8ClampedArray,
    dst: Uint8ClampedArray,
    width: number,
    height: number,
    colors: number
  ) {
    /**
     * ベクトル間距離
     *
     * @param {Uint8ClampedArray} vec1
     * @param {Uint8ClampedArray} vec2
     * @return {*}
     */
    const calcDistance = (vec1: Uint8ClampedArray, vec2: Uint8ClampedArray) => {
      let dist = 0;
      for (var i = 0; i < vec1.length; i++) {
        dist += Math.pow(Math.abs(Number(vec2[i]) - Number(vec1[i])), 2);
      }
      dist = Math.sqrt(dist);
      return dist;
    };

    const vmax = 255; // 配列要素の最大値
    const loopMax = 100; // ループ処理の最大回数

    // 初期化
    colors = parseInt(String(colors));
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

      if (exitFlg) break;

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
  }

  /**
   * ドット絵を見やすくする（拡大、グリッド線）
   *
   * @static
   * @param {*} inputImageData
   * @param {*} pixelSize
   * @param {*} grid
   * @return {*}
   * @memberof Pixelize
   */
  public static visualizePixel(
    inputImageData: ImageData,
    pixelSize: number,
    grid: boolean
  ) {
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
  }
}
