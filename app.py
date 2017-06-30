from flask import Flask, render_template, send_file

app = Flask('Mi Air Charts')

@app.route('/')
def index():
    return render_template("main.html")

@app.route('/air.csv')
def get_air_data():
    return send_file("air.csv")

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
