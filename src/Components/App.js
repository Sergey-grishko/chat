import React, {Component} from 'react';
import '../App.css';
import io from 'socket.io-client';
import {StyleSheet, css} from 'aphrodite';


const socket = io('http://dev.bidon-tech.com:65058/');

class App extends Component {
    constructor() {
        super();
        this.state = {
            messages: [],
            nickname: '',
            online: [],
            login: false,
            mess: '',
            name: "",
            hi: "Hi: ",
            history:[]
        }
    }


    componentDidMount() {
        socket.on('connect', () => {
            console.log('Connected to server')
            // История сообщений
            socket.on('history', history => {
                this.setState({history:history})
            })
            // список пользователей онлайн
            socket.on('online', list => {
                this.setState({online: list})
            })
            // никнейм присоединившегося пользователя
            socket.on('connected', nickname => {
                let mess = this.state.history
                let user = {nickname: "User " + nickname + " connected"}
                mess.push(user)
                this.setState({history: mess})
            })
            // никнейм отсоеденившегося пользователя
            socket.on('disconnected', nickname => {
                let mess = this.state.history
                let user = {nickname: "User " + nickname + " disconnected"}
                mess.push(user)
                this.setState({history: mess})
            })
            // сообщение от пользователя
            socket.on('message', message => {
                let mess = this.state.history
                mess.push(message)
                this.setState({history: mess})
                document.getElementById('mes').scroll(0, document.getElementById('mes').scrollHeight);
            })
        })
    }


    login(e) {
        e.preventDefault();
        if (this.state.nickname === '') {
            alert("Enter a name!")
        } else {
            let nickname = this.state.nickname;
            socket.emit('nickname', nickname, () => {
                this.setState({login: true})
            })
        }
    }

    send(e) {
        e.preventDefault();
        if (this.state.mess === '') {
            alert("Enter a message!")
        } else {
            let mess = this.state.mess;
            socket.emit('message', mess)
            this.setState({mess: ""})
        }
    }

    render() {
        let history = this.state.history.slice(this.state.history.length-20, this.state.history.length);
        let filter = this.state.history == null?(this.state.mess):history
        let online = this.state.online.map((value, index) => {
            return (
                <li key={index}><img alt="" width="40" src={require("../img/images.jpg")}/><p>{value}</p></li>
            )
        })
        let mess = filter.map((value, index) => {
            return (
                <li className={css(styles.mess)} key={index}><span>{value.nickname}</span> <span  className={css(styles.messText)} >{value.message}</span>
                    <div className={css(styles.time)}><p className={css(styles.time)}>{value.date}</p></div>
                </li>
            )
        });
        if (this.state.login === true) {
            setTimeout(() => this.setState({hi: "Your nickname: "}), 3000)
        }
        return (

            <div>
                <div className={css(styles.logo)}>
                    <p>СТІНА.UA</p>
                </div>
                <form className={this.state.login === false ? css(styles.online) : css(styles.offline)}>
                    <input type="text" required placeholder="Enter your nickname"
                           value={this.state.nickname}
                           onChange={(e) => this.setState({nickname: e.target.value})} id="nickname"/>
                    <button onClick={this.login.bind(this)}>Create new coinflip</button>
                </form>
                <form className={this.state.login === true ? css(styles.online) : css(styles.offline)}>
                        <span className={css(styles.icon)}><img alt=""
                            src={require("../img/4340.jpg")}/><p>{this.state.hi}{this.state.nickname}</p></span>
                    <ul id="mes" className={css(styles.message)}>
                        {mess}
                    </ul>
                    <input type="text" required value={this.state.mess}
                           onChange={(e) => this.setState({mess: e.target.value})}
                           placeholder="Enter your message" id="message"/>
                    <button onClick={this.send.bind(this)}>Send</button>
                    <div className={css(styles.user)}>
                        <label>User online:</label>
                        <ul>
                            {online}
                        </ul>
                    </div>
                </form>

            </div>

        );
    }
}

export default App;

const styles = StyleSheet.create({
    messText:{
      padding:"0 10px"
    },
    time:{
      width:200
    },
    user: {
        fontFamily: "cursive",
        marginTop: 15,
        paddingTop: 5,
        background: "#fff",
        ':nth-child(1n) > ul': {
            ':nth-child(1n) > li': {
                listStyle: "none",
                display: "flex",
                ':nth-child(1n) > img': {
                    height: 40,
                    borderRadius: 40
                },
                ':nth-child(1n) > p': {
                    fontSize: 25,
                    color: "green",
                    margin: "0 0 0 40px"
                }
            }
        },
        ':nth-child(1n) > label': {
            display: 'flex',
            justifyContent: "center"
        }
    },
    logo: {
        margin: 0,
        padding: 0,
        background: "#000",
        fontSize: "20px",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
    },
    offline: {
        display: "none"
    },
    icon: {
        fontFamily: "cursive",
        display: "flex",
        background: "#000",
        ':nth-child(1n) > img': {
            width: 80,
            height: 80,
            borderRadius: 40,
            background: "#fff"
        },
        ':nth-child(1n) > p': {
            margin: "auto",
            fontSize: 30,
            color: "#fff"
        }

    },
    online: {
        paddingTop: 50,
        margin: "auto",
        flexDirection: "column",
        width: "40%",
        display: "flex",
        ':nth-child(1n) > button': {
            marginTop: 10,
            background: "#FFA78A",
            border: "2px solid #FFA78A",
            fontSize: 20,
            borderRadius: 20,
            transition: "0.9s",
            ':hover': {
                background: "#fff",
                border: "2px solid #FFA78A",
                transition: "0.9s"
            },
            ':focus': {
                outline: "none",
            }
        },
        ':nth-child(1n) > input': {
            paddingLeft: 10,
            height: 40,
            borderRadius: 20,
            fontSize: 15,
            border: '1px solid #fff',
            transition: "0.9s",
            ':focus': {
                border: '1px solid #FFA78A',
                outline: "none",
                transition: "0.9s",
            }
        },
        ':nth-child(1n) > ul': {
            background: "#fff"
        }
    },
    message: {
        overflowY: 'auto',
        margin: "20px auto",
        textAlign: "center",
        padding: 0,
        height: 300,
        width: "100%",
        ':nth-child(1n) > li': {
            display: "flex",
            justifyContent: "space-between",
            listStyle: "none",
        }
    },
    mess: {
        fontFamily: "cursive",
        fontSize: 20
    }
});