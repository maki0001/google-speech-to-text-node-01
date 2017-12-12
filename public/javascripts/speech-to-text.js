//
// var start = function(){
//   console.log('start');
//
//   var socket;
//   (function(){
//     // socket通信が開始される
//     socket = io.connect("http://localhost:3000");
//   })();
// }
//
// var stop = function(){
//   console.log('stop');
// }

var wbScktUrl = location.protocol + '//' + location.host
console.log(wbScktUrl);
//画面表示時に実行される
// staticブロック的な動き？
var socket, emit;
(function(){
    // socket = io.connect("http://localhost:3000");
    socket = io.connect(wbScktUrl);
    emit = function (name, data){
        // json → 文字列に変換して送信する関数
        socket.emit(name, JSON.stringify(data));
    }
})();

//メイン
var ctx;
window.onload = function(){
    var startBtn = document.getElementById('start');
    var stopBtn = document.getElementById('stop');
    var message = document.getElementById('message');

    //TODO マイクの起動と音声データの送信
    startBtn.addEventListener("click", function(){
        console.log('start');

        // マイク起動
        ctx = new AudioContext();
        // マイク取る
        navigator.getUserMedia(
          { audio: true },
          function(stream) {
            // AudioNodeに
            var source = ctx.createMediaStreamSource(stream);

            // オーディオのサンプルに触るなら
            var bufferSize = 4096;
            var processor = ctx.createScriptProcessor(bufferSize, 1, 1);
            processor.onaudioprocess = function(ev) {
              // console.log('onaudioprocess');
              var inputBuffer  = ev.inputBuffer;
              var outputBuffer = ev.outputBuffer;

              var inputData  = inputBuffer.getChannelData(0);
              var outputData = outputBuffer.getChannelData(0);

              //何もしなくてもoutputは返さないと音が出ない
              outputData.set(inputData);
              //音声加工があればここに書く

              socket.emit('audio', outputData.buffer);

              // // Float32なArrayBuffer
              // var inputData  = inputBuffer.getChannelData(0);
              // var outputData = outputBuffer.getChannelData(0);
              //
            };

            var biquadFilter = ctx.createBiquadFilter();
            biquadFilter.type = 'bandpass';
            biquadFilter.frequency.value = (100 + 7000) / 2;
            biquadFilter.Q.value = 0.25;

            // source.connect(processor);
            // processor.connect(ctx.destination);
            source.connect(processor);
            processor.connect(biquadFilter);
            biquadFilter.connect(ctx.destination);
          },
          function(err) {
            console.error(err);
          }
        );

        // emit('message', {text: message.value});
    });

    // socket.on('receiveMessage', function(d){
    //     var data = JSON.parse(d), // 文字列→JSON
    //         li = document.createElement('li'), // liタグ作成
    //         list = document.getElementById('messageList'); // ulタグの取得
    //     li.textContent = data.text; // liタグに値を入れる
    //     list.appendChild(li); // ulタグの子ノードとして作成したliタグを追加
    // });

    //TODO 音声の変換結果を取得する
    socket.on('receiveTranscribedMessage', d => {
        console.log('on receiveTranscribedMessage');
        var data = JSON.parse(d), // 文字列→JSON
            li = document.createElement('li'), // liタグ作成
            list = document.getElementById('messageList'); // ulタグの取得
        li.textContent = data.text; // liタグに値を入れる
        list.appendChild(li); // ulタグの子ノードとして作成したliタグを追加
    });

    //TODO マイク停止
    stopBtn.addEventListener("click", function(){
      // var ctx = new AudioContext();
      ctx.close();
    });
};
