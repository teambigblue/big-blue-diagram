from flask import Flask, render_template,request,url_for,redirect,flash,session,Response
app = Flask(__name__)

@app.route("/",methods=["POST","GET"])
def hello():
    return render_template("main.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
