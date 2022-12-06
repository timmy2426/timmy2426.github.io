onmessage = function (e) {
  let c = e.data.count;
  function counter() {
    c--;
    if (c >= 0) {
      postMessage({ count: c });
    } else {
      close();
    }
  }
  setInterval(counter, 10);
};
