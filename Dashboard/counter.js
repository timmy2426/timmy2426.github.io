onmessage = function (e) {
  let c = e.data.count;
  function counter() {
    c++;
    postMessage({ count: `${c}` });
  }
  setInterval(counter, 10);
};
