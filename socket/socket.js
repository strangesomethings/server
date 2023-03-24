const Socketio = require('socket.io')
var player = []
var map = []
//산소 소모량
var door_ox_per = 6
var health_ox_per = 5
var generator_ox_per = 4
var meterial_ox_per = 4
var oxygen_room_ox_supply_per = 100
var main_room_ox_supply_per = 30 // 보조 룸 비활성화
//var s_main_room_ox_supply_per = 50 // 보조 룸 활성화
var vent_ox_per = 5
var vaccine_ox_per = 5
var hiding_ox_per = 3
//산소 소모량
// 쿨다운(대기시간) -> 타이머 이벤트는 클라이언트에서 작동하도록 함.
// 쿨다운(대기시간)
//발전기 고쳐진 정도
var infirmary_generator_per = 0
var oxygen_generator_per = 0
var engine_generator_per = 0
var laboratory_generator_per = 0
var electricity_generator_per = 0
// 발전기 고쳐진 정도
var generator_level = 0 //발전기 고쳐진 개수(0 -> 20%씩 수리, 1-> 15%, 2-> 10%)

//재료 파밍 속도
var meterial_speed = 7
var monster_location = -1

//=================================시스템 이벤트================================
function game_init(map) { // 게임 초기 설정. 맵의 재료, 발전기, 산소 등등.
    let sub_room = [dining_room,storage_room,pilot_room,bed_room,cctv_room,
        health_room,conference_room,trash_room,communication_room,machine_room]
    let main_room = [oxygen_room,infirmary_room,engine_room,laboratory_room,electricity_room]
    let hallway = [oxygen_hallway,infirmary_hallway,engine_hallway,laboratory_hallway,electricity_hallway]
    for(let i=0; i<15;i++) {
        if(i%3 == 0 || i == 0) {
            let main_place = main_room.pop()
            let map_form = {place: main_place, door: true, generator: 0, oxygen: true, player: []}
            map.push(map_form)
        }// 0,3,6,9,12
        else{
            let sub_place = sub_room.pop()
            let map_form = {place: sub_place, door: true, material: true, oxygen_supply: false, vent: true, player: []}
            map.push(map_form)
        }//(1,2), (4,5), (7,8), (10,11), (13,14) 벤트는 2 차이나는 서브룸끼리 이어짐. (%14)    
    }
    for(let i=0;i<hallway.length;i++) {
        let hallway_place = hallway[i]
        let map_form = {place: hallway_place, player: []}
        map.push(map_form)
    }// (각 복도 인덱스-15)*3 = 이어진 메인 룸 인덱스
}
function game_start() { //게임 시작
    game_init()
    for(let i=0;i<player.length;i++) {
        map[0].push(player[i].player_number)
        player[i].location = 3
    }//산소룸에서 게임 시작, 30초 동안 돌아다닌 후 술래 지정(func. choose_monster)
}
function choose_monster(player) { //술래 정하기
    let personnel = player.length
    randNum = Math.floor(Math.random()*personnel)
    player[randNum].role = 'monster'
    monster_location = player.location
    return player
}
// 시민
function inquire_location(some_player) { // 현재 자신의 위치 조회(해당 맵 정보(index)를 반환함)
    return some_player.location
}
function playerlist_of_location(location_index) { //방에 있는 모든 인원(사람) 리턴
    return map[location_index].player
}
function map_name_to_index(map_name) {
    let err = 1
    for(let i=0; i<map.length;i++){
        if(map.place == map_name) {
            err = 0
            return i
        }
    }
    if(err ==1) {
        return -1
    }
}
//괴물


//=====================플레이어 행동==================
function move_room(player, destination_index) { // 방 이동
    let location_index = inquire_location(player)
    for(let i=0;i<map[location_index].player.length;i++){//이전 방에서 플레이어 이름 제거
        if(map[location_index].player[i] == player.player_number) {
            map[location_index].player.splice(i,i+1)
        }
    }
    for(let i=0;i<map.length;i++) { //이동할 방에 플레이어 이름 추가
        map[destination_index].player.append(player.player_number)
        player.location = destination_index
    }
    if(player.role == 'survivor'){ //이동 한 사람이 생존자일때
        if(destination_index == monster_location) {
            meet_monster(player)
        }
    }
    else{ // 이동한 사람이 괴물일 때
        if(map[destination_index].player.length > 1)
        {
            for(let i=0;i<map[destination_index].player.length;i++) {
                if(map[destination_index].player[i].role != 'monster') {
                    meet_monster(player[map[destination_index].player[i]])                    
                }
            }
            monster_location = destination_index
        }
    }
}
function moster_sensor(player) { //괴물 센서(누군가 이동할때마다 콜) 미완.
    let location_index = inquire_location(player)
    map[i]
}
function player_hiding(player) { // 숨기 << 수정?
    player.stat = 'hiding'
    player.oxygen -= hiding_ox_per
    return player
}
function player_door_touch(player) { // 문 상호작용
    map[i] = lock_door(map[i])
    player.oxygen -= door_ox_per
}
function player_touch_generator(player) { //발전기 사용
    player.oxygen -= generator_ox_per
    //발전기 작동 함수 콜
    
}
function meterial_farming(player, key) { // 재료파밍
    player.oxygen -= meterial_ox_per
    if(key == true) {
        let randnum = Math.random(3)
        player.meterial += 1
    }
    return player
}
function oxygen_charge(player, key) { // 산소충전 key는 산소룸 = true/ 다른 메인룸 = false
    if(key == true) {
        player.oxygen = oxygen_room_ox_supply_per
    }
    else {
        if((player.oxygen+main_room_ox_supply_per) >= 100) player.oxygen = 100
        else player.oxygen += main_room_ox_supply_per
    }
}
function oxygen_subroom_fix(player, key) { //서브 룸 산소 시스템 활성화(player)
    if(key == true) {
        player.oxygen -= 5
    }
}


//==================상호작용===============
function meet_monster(player) { //괴물 조우
    player.stat = 'infect'
    return player
}
function lock_door(location) { //문 잠그기/ 문 잠그기 해제
    if(location.door == true) location.door = false
    else location.door = true
    return location
}
function is_mainroom(gen) { //메인룸인지 확인
    let gen_idx = map_name_to_index(gen)
    if(gen_idx!=0 && gen_idx%3!=0) gen_idx = -1
    return gen_idx
}
function fix_generator(gen_idx,key) { //발전기 수리 key는 미니 미션 성공 여부(리듬겜)
    let fix_level = 0
    if(generator_level == 0) fix_level = 20
    else if(generator_level == 1) fix_level = 15
    else if(generator_level == 2) fix_level = 10
    if(key == false) fix_level = -5
    if(gen_idx == 0) oxygen_generator_per += fix_level
    else if(gen_idx == 3) infirmary_generator_per += fix_level
    else if(gen_idx == 6) engine_generator_per += fix_level
    else if(gen_idx == 9) laboratory_generator_per += fix_level
    else if(gen_idx == 12) electricity_generator_per += fix_level
    return generator
}
//let main_room = [oxygen_room,infirmary_room,engine_room,laboratory_room,electricity_room]
function health_quest(key, player) { // 체력단련실 미션
    if(key == true) meterial_speed = 5
    player.oxygen -= 5
}
function oxygen_mainroom_use(room) { //메인룸 산소 시스템 비활성화
    room.oxygen= false
    return room
}
function oxygen_subroom_active(room) { //서브룸 산소 시스템 활성화
    room.oxygen_supply = true
    return room
}
//쿨타임 지난 후 재충전
function vent_cooldown(room) {
    room.vent = true
}
function oxygen_cooldown(room) { //메인룸 산소 쿨
    room.oxygen = true
}
function meterial_cooldown(room) {
    room.meterial = true
}
function vaccine_cooldown(room) {
    room.vaccine = true
}

/*
main_room = {place: main_room[i], generator: 0, oxygen: true, player: []}
sub_room = {place: room[i], door: true, material: true, oxygen_supply: true, vent: true, player: []}
order : (sub-room) dining_room,storage_room,pilot_room,bed_room,cctv_room,
        health_room,conference_room,trash_room,communication_room,machine_room,
        (main-room) infirmary_room,oxygen_room,engine_room,laboratory_room,electricity_room
let player_form = {name: name, player_number: index, ready: false, role: survivor, oxygen: 100, meterial: 0, vaccine: 0, 
                            oxygen_buff: false, elec_buff: false, engine_buff: false, laboratory_buff: false, infirmary_buff: false,
                            health_buff: false, stat: 'live', location: -1} // stat: 기절,감염 여부 (live/faint/infect/hiding), loaction = -1: 로비, 0~14 각 장소
*/

//괴물

function monster_seeking(monster) { // 숨어있는 플레이어 탐색
    room_idx = inquire_location(monster)
    if(map[room_idx].player.length > 1) {
        
    }
    else if(map[room_idx].player.length == 1) {

    }
    else{

    }
}
function monster_door_touch(monster) { // 문 상호작용
    map[i] = lock_door(map[i])
}
function monster_touch_generator(generator_per) { //발전기 고장내기
    generator_per -= 10
    if( generator_per <= 0) generator_per = 0
    return generator_per
}
function moster_search_boost(){ // 탐색부스트(술래 능력)

}
function moster_prevent_vent() {//환기구 봉쇄

}
function monster_prevent_doorlock() {//문 잠금 봉쇄

}
function monster_prevent_sensor() { //감지 무력화

}


module.exports = (server) => {
    
    const io = Socketio(server, {
        cors: {
            origin: "*",
            credential:true
        }
    })
    io.on('connection',(socket) => {    
        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('새로운 클라이언트 접속! ip:', ip,'socketid:', socket.id,'reqip:', req.ip);


        socket.on('disconnect', () => { // 연결 종료 시
            console.log('클라이언트 접속 해제', ip, socket.id);
            for(let i=0;i<deception_player.length;i++) {
                if(deception_player[i].socketid == socket.id) {
                    deception_player.splice(i,1)
                    socket.leave(room)
                    socket.emit('disconnect',deception_player)
                    console.log(deception_player[i].name,'님, ',room+'번 방 leave 완료!')
                }
            }
            clearInterval(socket.interval);
        });

        socket.on('chatting', (data) => {
            let msg_time = moment(new Date()).format("YYYY-MM-DD hh:mm:ss")
            const {name, message, room} = data.message;
            console.log('n: ',name)
            console.log('m: ',message)
            console.log('r: ',room)

            socket.broadcast.to(room).emit('chatting',{
                name,
                message,
                msg_time,
            })
            console.log('emit 완료')
        })    
    
        socket.on('joingame', (data) => {
            const {name,room} = data.name
            
            let msg = ''
            if (data.room != '') {
                for(let i=0;i<player.length;i++) {
                    if (player[i].name == name){
                        msg = 'dupplicate'
                        socket.emit({code: 400, message: msg})
                    }
                    else {
                        msg = 'success'
                        let index = player.length
                        let player_form = {name: name, player_number: index, ready: false, role: survivor, oxygen: 100, meterial: 0, vaccine: 0, 
                            oxygen_buff: false, elec_buff: false, engine_buff: false, laboratory_buff: false, infirmary_buff: false,
                            health_buff: false, stat: 'live', location: -1} // stat: 기절,감염 여부 (live/faint/infect/hiding), loaction = -1: 로비, 0~14 각 장소
                        player.push(player_form)
                        socket.emit({code: 400, message: msg})
                        socket.join(room)
                    }
                }  
            } 
            else{
                console.log('value is empty!')
            }         
        })

        socket.on('ready',(data) => {
            const {name,room} = data
            for(let i=0; i<player.length;i++){
                if(player[i].name == name) {
                    if(player[i].ready == true){
                        player[i].ready = false
                    }
                    else {
                        player[i].ready = true
                    }
                }
            }
            let everyone_ready = true
            for(let i=0;i<player.length;i++){
                if(player[i].ready == false) {
                    everyone_ready = false
                    break
                }
            }
            socket.to(room).emit('ready',{ready}) // 모두 레디를 한지 여부(t/f)
        })

        socket.on('startgame',(data) => {
            game_start()
            socket.to(room).emit('startgame', {map, player})
        })

        socket.on('choosemonster',(data) => {
            choose_monster()
            socket.to(room).emit('choosemoster',map,player)
        })

        socket.on('move',(data) => {
            const {player_name, destination, room} = data
            let flag = 0
            let destination_index = map_name_to_index(destination)
            for(let i=0;i<player.length;i++) {
                if (player[i].name == player_name) {
                    move_room(player[i], destination_index)
                    let pinfo = player[i]
                    socket.to(room).emit('move', {map, pinfo})
                    flag = 1
                }
            }
            if (flag == 0) {
                socket.to(room).emit('move','error')
            }
        })        

        socket.on('lockdoor',(data)=>{
            const {location, room} = data
            let location_idx = map_name_to_index(location)
            lock_door(location_idx) //잠겨져 있으면 잠금해제, 열려있으면 잠금
            socket.emit('lockdoor', map, player)
        })

        socket.on('fixgenerator',(data)=>{
            const {location, key, room} = data
            let gen_idx = is_mainroom(location)
            fix_generator(gen_idx)
        })

        socket.on('gameinfo',(data) => {
            const {room} = data
            socket.to(room).emit('gameinfo', {map, player})
        })

        socket.on('playerinfo',(data) => {
            const {room, player_name} = data
            let flag = 0
            for(let i=0;i<player.length;i++) {
                if (player[i].name == player_name) {
                    move_room(player[i], destination)
                    socket.to(room).emit('playerinfo', player[i])
                    flag = 1
                }
            }
            if (flag == 0) {
                socket.to(room).emit('playerinfo','error')
            }
        })

        socket.on('leavegame',(data) => {
            let {name, room} = data.room
            if (data.room != '') {
                for (let i=0;i<player.length;i++){
                    if(player[i].name == name){
                        player.splice(i,1)
                    }
                }
                socket.leave(room)
                console.log(room+'번 방 leave 완료!')
            }
            else{
                console.log('value is empty!')
            }
        })

        
    
    })
}
