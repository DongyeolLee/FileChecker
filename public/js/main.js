const submit = () => {
  const file = document.getElementById("file").files[0];

  if (file) {
    const owner = document.getElementById("owner").value;

    if (owner == "") {
      alert("Please enter owner name");
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const hash = sha1(event.target.result);

        $.get("/submit?hash=" + hash + "&owner=" + owner, (data) => {
          if (data == "Error") {
            $("#message").text("An error occured.");
          } else {
            $("#message").html("Transaction hash: " + data);
          }
        });
      };
      reader.readAsArrayBuffer(file);
    }
  } else {
    alert("Please select a file");
  }
};

const getInfo = () => {
  const file = document.getElementById("file").files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const hash = sha1(event.target.result);

      $.get("/getInfo?hash=" + hash, (data) => {
        if (data[0] == 0 && data[1] == "") {
          $("#message").html("File not found");
        } else {
          $("#message").html("Timestamp: " + data[0] + " Owner: " + data[1]);
        }
      });
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Please select a file");
  }
};

const socket = io("http://localhost:8080");

socket.on("connect", function () {
  socket.on("message", function (msg) {
    if ($("#events_list").text() == "No Transaction Found") {
      $("#events_list").html("<li>Txn Hash: " + msg.transactionHash + "\nOwner: " + msg.args.owner + "\nFile Hash: " + msg.args.fileHash + "</li>");
    } else {
      $("#events_list").prepend("<li>Txn Hash: " + msg.transactionHash + "\nOwner: " + msg.args.owner + "\nFile Hash: " + msg.args.fileHash + "</li>");
    }
  });
});
