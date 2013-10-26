from flask import Flask,render_template,request,url_for,redirect,flash,session,Response
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("main.html")

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')
