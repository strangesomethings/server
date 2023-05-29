const Socketio = require('socket.io')
/** 모든게 들어있는 변수.
 *  room_number: room_number,
 *       player: [],
 *       player_form = {name: name, player_number: index, ready: false, role: 'survivor', oxygen: 100, meterial: 0, vaccine: 0, 
                            oxygen_buff: false, elec_buff: false, engine_buff: false, laboratory_buff: false, infirmary_buff: false,
                            health_buff: false, stat: 'live', location: -1} // stat: 기절,감염 여부 (live/faint/infect/hiding), loaction = -1: 로비, 0~14 각 장소
 *       map: [],
 *       //map_form = {place: main_place, door: true, generator: 0, oxygen: true, player: []}
 *      ///////oxygen_room,infirmary_room,engine_room,laboratory_room,electricity_room/////
 *       //map_form = {place: sub_place, door: true, material: true, oxygen_supply: false, vent: true, player: []}
 *       //산소 소모량
 *       door_ox_per: 6,
 *       health_ox_per: 5,
 *       generator_ox_per: 4,
 *       meterial_ox_per: 4,
 *       oxygen_room_ox_supply_per: 100,
 *       main_room_ox_supply_per: 30, // 보조 룸 비활성화
 *       //var s_main_room_ox_supply_per = 50, // 보조 룸 활성화
 *       //var s_main_room_ox_supply_per = 50, // 보조 룸 활성화
 *       vent_ox_per: 5,
 *       vaccine_ox_per: 5,
 *       hiding_ox_per: 3,
        //산소 소모량
        // 쿨다운(대기시간) -> 타이머 이벤트는 클라이언트에서 작동하도록 함.
        // 쿨다운(대기시간)
        //발전기 고쳐진 정도
        //산소 소모량
        // 쿨다운(대기시간) -> 타이머 이벤트는 클라이언트에서 작동하도록 함.
        // 쿨다운(대기시간)
        //발전기 고쳐진 정도
 *       infirmary_generator_per: 0,
 *       oxygen_generator_per: 0,
 *       engine_generator_per: 0,
 *       laboratory_generator_per: 0,
 *       electricity_generator_per: 0,
        // 발전기 고쳐진 정도
        // 발전기 고쳐진 정도
 *       generator_level: 0, //발전기 고쳐진 개수(0 -> 20%씩 수리, 1-> 15%, 2-> 10%)

        //재료 파밍 속도
        //재료 파밍 속도
 *       meterial_speed: 7,
 *       monster_location: -1,
 */
var game_room = []

//=================================시스템 이벤트================================
/** 최초 방 입장 시 변수 설정 */
function setting_room(room_number){
    form = {
        room_number: room_number,
        player: [],
        map: [],
        //산소 소모량
        door_ox_per: 6,
        health_ox_per: 5,
        generator_ox_per: 4,
        meterial_ox_per: 4,
        oxygen_room_ox_supply_per: 100,
        main_room_ox_supply_per: 30, // 보조 룸 비활성화
        //var s_main_room_ox_supply_per = 50, // 보조 룸 활성화
        //var s_main_room_ox_supply_per = 50, // 보조 룸 활성화
        vent_ox_per: 5,
        vaccine_ox_per: 5,
        hiding_ox_per: 3,
        //산소 소모량
        // 쿨다운(대기시간) -> 타이머 이벤트는 클라이언트에서 작동하도록 함.
        // 쿨다운(대기시간)
        //발전기 고쳐진 정도
        //산소 소모량
        // 쿨다운(대기시간) -> 타이머 이벤트는 클라이언트에서 작동하도록 함.
        // 쿨다운(대기시간)
        //발전기 고쳐진 정도
        infirmary_generator_per: 0,
        oxygen_generator_per: 0,
        engine_generator_per: 0,
        laboratory_generator_per: 0,
        electricity_generator_per: 0,
        // 발전기 고쳐진 정도
        // 발전기 고쳐진 정도
        generator_level: 0, //발전기 고쳐진 개수(0 -> 20%씩 수리, 1-> 15%, 2-> 10%)

        //재료 파밍 속도
        //재료 파밍 속도
        meterial_speed: 7,
        monster_location: -1,
        // 변수 서버에 저장 -> 완성 후에는 radis 같은 캐시 메모리에 저장하도록 시도해볼 것
    }
    game_room.push(form)
}
/** 새로운 플레이어 정보 삽입 */
function add_player(room_num, name) {
    const room_index = get_room_index(room_num)
    let index = get_player_num(room_num)
    let player_form = {name: name, player_number: index, ready: false, role: 'survivor', oxygen: 100, meterial: 0, vaccine: 0, 
    oxygen_buff: false, elec_buff: false, engine_buff: false, laboratory_buff: false, infirmary_buff: false,
    health_buff: false, stat: 'live', location: -1} 
    game_room[room_index].player.push(player_form)
}
/** 해당 방 정보 조회 */
function get_room_info(room_num) {
    return game_room.find(item => item.room_number == room_num)
}
/** 해당 방 인덱스 조회
 *  배열 안에 있는 값을 변경하는 등의 작업에 사용
 */
function get_room_index(room_num) {
    return game_room.findIndex(item => item.room_number == room_num)
}
/** 게임 초기 설정. 맵의 재료, 발전기, 산소 등등. (필요인자: map)*/
function game_init(room_num) { 
    const room_index = get_room_index(room_num)

    let sub_room = [dining_room,storage_room,pilot_room,bed_room,cctv_room,
        health_room,conference_room,trash_room,communication_room,machine_room]
    let main_room = [oxygen_room,infirmary_room,engine_room,laboratory_room,electricity_room]
    let hallway = [oxygen_hallway,infirmary_hallway,engine_hallway,laboratory_hallway,electricity_hallway]
    for(let i=0; i<15;i++) {
        if(i%3 == 0 || i == 0) {
            let main_place = main_room.pop()
            let map_form = {place: main_place, door: true, generator: 0, oxygen: true, player: []}
            game_room[room_index].map.push(map_form)
        }// 0,3,6,9,12
        else{
            let sub_place = sub_room.pop()
            let map_form = {place: sub_place, door: true, material: true, oxygen_supply: false, vent: true, player: []}
            game_room[room_index].map.push(map_form)
        }//(1,2), (4,5), (7,8), (10,11), (13,14) 벤트는 2 차이나는 서브룸끼리 이어짐. (%14)    
    }
    for(let i=0;i<hallway.length;i++) {
        let hallway_place = hallway[i]
        let map_form = {place: hallway_place, player: []}
        game_room[room_index].map.push(map_form)
    }/** (각 복도 인덱스-15)*3 = 이어진 메인 룸 인덱스*/
}
/** 플레이어 입장/퇴장시 사용
 * 중복 안되게끔 마지막 들어온 사람의 index +1을 부여함. */
function get_player_num(room_num) {
    const room_index = get_room_index(room_num)
    //인원이 이미 존재할 경우
    if (game_room[room_index].player.length> 0) return game_room[room_index].player[player.length-1].index+1
    else return 0
}
/**게임 시작*/
function game_start(room_num) { 
    game_init(room_num)
    const room_index = get_room_index(room_num)
    for(let i=0;i< game_room[room_index].player.length;i++) {
        game_room[room_index].map[0].push(game_room[room_index].player[i].player_number)
        game_room[room_index].player[i].location = 3
    }//산소룸에서 게임 시작, 30초 동안 돌아다닌 후 술래 지정(func. choose_monster)
}
/**술래 정하기(player)*/
function choose_monster(room_num) { 
    const room_index = get_room_index(room_num)
    let personnel = game_room[room_index].player.length
    randNum = Math.floor(Math.random()*personnel)
    game_room[room_index].player[randNum].role = 'monster'
    game_room[room_index].monster_location = game_room[room_index].player.location
    //return game_room[room_index].player
}
/** player_num에 해당하는 유저의 player배열 인덱스 반환 */
function find_player_index_by_playerNum(room_num, player_num) {
    const room_index = get_room_index(room_num)
    return game_room[room_index].player.findIndex(item => item.player_num == player_num)
}
/** player_num에 해당하는 player의 위치를 location_idx로 변경 */
function change_player_location(room_num,player_num,location_idx) {
    const room_index = get_room_index(room_num)
    player_index = game_room[room_index].findIndex(item => item.player_number == player_num)
    if(player_index != -1) {
        game_room[room_index].player[player_index].location = location_idx
    }
}
//============================ 게임 플레이 ============================
// 시민
/** player_num으로 현재 자신의 위치 조회(해당 맵 정보(index)를 반환함)*/
function inquire_location(room_num,some_player_num) { 
    const room_index = get_room_index(room_num)
    player_idx = find_player_index_by_playerNum(room_num,some_player_num)
    return game_room[room_index].player[player_idx].location
}
/** player_num으로 player_idx를 반환 */
function inquire_player_index(room_num, player_num) {
    const room_index = get_room_index(room_num)
    return game_room[room_index].player.findIndex(item => item.player_number == player_num)
}
/** 해당 장소에 있는 모든 인원(사람) 리턴 */
function playerlist_of_location(room_num,location_index) { 
    const room_index = get_room_index(room_num)
    return game_room[room_index].map[location_index].player
}
/** 해당 장소의 이름으로 인덱스 반환 */
function map_name_to_index(room_num,map_name) {
    const room_index = get_room_index(room_num)
    return game_room[room_index].map.findIndex(item => item.place == map_name)
}
//괴물


//=====================플레이어 행동==================
/** 장소 이동 */ 
function move_room(room_num, player_num, destination_index) { 
    const room_index = get_room_index(room_num)
    let pre_location_index = inquire_location(player_num) //플레이어가 위치한 이전 위치
    /** 이전 장소의 player 리스트에서 해당 player 정보 삭제 */
    const target_map_player_index = game_room[room_index].map[pre_location_index].findIndex(item => item.player == player_num)
    if (target_map_player_index!= -1) {
        game_room[room_index].map[pre_location_index].player.splice(target_map_player_index,1)
    }
    /** 이동할 장소에 플레이어 번호 추가 */
    game_room[room_index].map[destination_index].player.append(player_num)
    change_player_location(room_num, player_num, destination_index)
    const player_idx = inquire_player_index(room_num,player_num)

    if(game_room[room_index].player[player_idx].role == 'survivor'){ //이동 한 사람이 생존자일때
        if(destination_index == game_room[room_index].monster_location) {
            meet_monster(player_idx)
        }
    }
    else{ // 이동한 사람이 괴물일 때
        if(game_room[room_index].map[destination_index].player.length > 1)
        {
            for(let i=0;i<game_room[room_index].map[destination_index].player.length;i++) {
                if(game_room[room_index].map[destination_index].player[i].role != 'monster') {
                    meet_monster(room_num, game_room[room_index].player[map[destination_index].player[i]])                    
                }
            }
            game_room[room_index].monster_location = destination_index
        }
    }
}
/**괴물 센서(누군가 이동할때마다 콜) 미완.*/
function moster_sensor(room_num) { 
    let location_index = inquire_location(player)
    map[i]
}
/**숨기 << 수정?*/
function player_hiding(room_num, player_num) { 
    const room_index = get_room_index(room_num)
    const player_idx = inquire_player_index(room_num,player_num)
    game_room[room_index].player[player_idx].stat = 'hiding'
    game_room[room_index].player[player_idx].oxygen -= game_room[room_index].hiding_ox_per
}
/** 문 상호작용 */
function player_door_touch(room_num, location_idx, player_num) { 
    const room_index = get_room_index(room_num)
    const player_idx = inquire_player_index(room_num,player_num)
    game_room[room_index].map[location_idx] = lock_door(room_num,location_idx)
    player.oxygen -= door_ox_per
}
/** 발전기 사용 미완*/
function player_touch_generator(room_num,player_num) { 
    const room_index = get_room_index(room_num)
    const player_idx = inquire_player_index(room_num,player_num)
    game_room[room_index].player[player_idx].oxygen -= game_room[room_index].generator_ox_per

    //발전기 작동 함수 콜
    
}
/** 재료파밍 
 * 랜덤으로 실패확률 넣는거 아직 미완!*/
function meterial_farming(room_num,player_num, key) { 
    const room_index = get_room_index(room_num)
    const player_idx = inquire_player_index(room_num,player_num)
    game_room[room_index].player[player_idx].oxygen -= game_room[room_index].meterial_ox_per
    if(key == true) {
        let randnum = Math.random(3)
        game_room[room_index].player[player_idx].meterial += 1
    }
}
/** 보조 룸 화성화 여부 반환 미완*/
function oxygen_key_active(room_num) {

}
/**산소충전 key는 서브룸 산소 시스템 활성화시 = true
 * 아직 산소 사용 후 쿨다운은 구현 안됨.
*/
function oxygen_charge(room_num,player_num,location_idx) { 
    const room_index = get_room_index(room_num)
    const player_idx = inquire_player_index(room_num,player_num)
    //산소방일 경우
    if(location_idx == 0) {
        game_room[room_index].player[player_idx].oxygen = game_room[room_index].oxygen_room_ox_supply_per
    }
    else { //나머지 메인 룸의 경우.
        if((game_room[room_index].player[player_idx].oxygen+game_room[room_index].main_room_ox_supply_per) >= 100) game_room[room_index].player[player_idx].oxygen = 100
        else game_room[room_index].player[player_idx].oxygen += game_room[room_index].main_room_ox_supply_per
    }
    // if(key == true) {
    //     
    // }
    // else {
    //     if((player.oxygen+main_room_ox_supply_per) >= 100) player.oxygen = 100
    //     else player.oxygen += main_room_ox_supply_per
    // }
}
/**서브 룸 산소 시스템 활성화
 * key는 서브 퀘스트?의 성공 여부 등.
*/
function oxygen_subroom_fix(room_num,player_num, key) { 
    const room_index = get_room_index(room_num)
    const player_idx = inquire_player_index(room_num,player_num)
    if(key == true) {
        game_room[room_index].player[player_idx].oxygen -= 5
    }
}


//==================상호작용===============
/**괴물 조우*/
function meet_monster(room_num,player_idx) { 
    const room_index = get_room_index(room_num)
    game_room[room_index].player[player_idx].stat = 'infect'
    return player
}
 /**문 잠그기/ 문 잠그기 해제*/
function lock_door(room_num,location_idx) {
    const room_index = get_room_index(room_num)
    if(game_room[room_index].map[location_idx].door == true) game_room[room_index].map[location_idx].door = false
    else game_room[room_index].map[location_idx].door = true
}
/**메인룸인지 확인*/
function is_mainroom(room_num,location) { 
    let gen_idx = map_name_to_index(room_num,location)
    if((gen_idx!=0 && gen_idx%3!=0) || gen_idx<15) gen_idx = -1
    return gen_idx
}
/**발전기 수리 key는 미션 성공 여부(리듬겜 등)
 * 수리가 완료되는 경우는 아직 미완
*/
function fix_generator(room_num,gen_idx,key) { 
    const room_index = get_room_index(room_num)
    let fix_level = 0
    //미션이 실패 한 경우
    if(key == false) fix_level = -5
    else{//미션 성공 한 경우
        if(game_room[room_index].generator_level == 0) fix_level = 20
        else if(game_room[room_index].generator_level == 1) fix_level = 15
        else if(game_room[room_index].generator_level == 2) fix_level = 10    
    }
    if(gen_idx == 0) game_room[room_index].oxygen_generator_per += fix_level
    else if(gen_idx == 3) game_room[room_index].infirmary_generator_per += fix_level
    else if(gen_idx == 6) game_room[room_index].engine_generator_per += fix_level
    else if(gen_idx == 9) game_room[room_index].laboratory_generator_per += fix_level
    else if(gen_idx == 12) game_room[room_index].electricity_generator_per += fix_level
}
/**체력단련실 미션, key는 미션 성공 여부*/
function health_quest(room_num,key, player_num) { 
    const room_index = get_room_index(room_num)
    const player_idx = inquire_player_index(room_num,player_num)
    if(key == true) game_room[room_index].meterial_speed = 5
    game_room[room_index].player[player_idx].oxygen -= 5
}
/**메인룸 산소 시스템 비활성화*/
function oxygen_mainroom_use(room_num,location_idx) { 
    const room_index = get_room_index(room_num)
    game_room[room_index].map[location_idx].oxygen= false
}
/**서브룸 산소 시스템 활성화*/
function oxygen_subroom_active(room_num,location_idx) { 
    game_room[room_index].map[location_idx].oxygen_supply = true
}
/**쿨타임 지난 후 재충전*/
function vent_cooldown(room_num,location_idx) {
    const room_index = get_room_index(room_num)
    game_room[room_index].map[location_idx].vent = true
}
/**메인룸 산소 쿨*/
function oxygen_cooldown(room_num,location_idx) { 
    const room_index = get_room_index(room_num)
    game_room[room_index].map[location_idx].oxygen = true
}
function meterial_cooldown(room_num,location_idx) {
    const room_index = get_room_index(room_num)
    game_room[room_index].map[location_idx].meterial = true
}
function vaccine_cooldown(room_num,location_idx) {
    const room_index = get_room_index(room_num)
    game_room[room_index].map[location_idx].vaccine = true
}

//괴물
/**숨어있는 플레이어 탐색 미완*/
function monster_seeking(room_num,monster_player_idx,location_idx) { 
    const room_index = get_room_index(room_num)
    room_idx = inquire_location(room_num, monster_player_idx)
    if(game_room[room_index].map[location_idx].player.length > 1) {
        
    }
    else if(game_room[room_index].map[location_idx].player.length == 1) {

    }
    else{

    }
}
/**문 상호작용*/
function monster_door_touch(room_num,location_idx) { 
    lock_door(room_num,location_idx)
}
/**발전기 고장내기*/
function monster_touch_generator(room_num, player_num, location_idx) { 
    const room_index = get_room_index(room_num)
    const player_idx = inquire_player_index(room_num,player_num)
    location_idx = inquire_location(room_num, player_idx)
    if (location_idx == 0) {
        game_room[room_index].oxygen_generator_per -= 20
        if( game_room[room_index].oxygen_generator_per <= 0) game_room[room_index].oxygen_generator_per = 0
    }
    else if (location_idx == 3) {
        game_room[room_index].infirmary_generator_per -= 20
        if( game_room[room_index].infirmary_generator_per <= 0) game_room[room_index].infirmary_generator_per = 0
    }
    else if (location_idx == 6) { 
        game_room[room_index].engine_generator_per-= 20
        if( game_room[room_index].engine_generator_per <= 0) game_room[room_index].engine_generator_per = 0
    }
    else if (location_idx == 9) { 
        game_room[room_index].laboratory_generator_per -= 20
        if( game_room[room_index].laboratory_generator_per <= 0) game_room[room_index].laboratory_generator_per = 0
    }
    else if (location_idx == 12) { 
        game_room[room_index].electricity_generator_per -= 20
        if( game_room[room_index].electricity_generator_per <= 0) game_room[room_index].electricity_generator_per = 0
    }
}
/** 탐색부스트(술래 능력)*/
function moster_search_boost(){ 

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
            for(let i=0;i<game_room[room_index].player.length;i++) {
                if(game_room[room_index].player[i].socketid == socket.id) {
                    game_room[room_index].player.splice(i,1)
                    socket.leave(room)
                    socket.emit('disconnect',player)
                    console.log(game_room[room_index].player[i].name,'님, ',room+'번 방 leave 완료!')
                }
            }
            clearInterval(socket.interval);
        });

        socket.on('chatting', (data) => {
            let msg_time = moment(new Date()).format("YYYY-MM-DD hh:mm:ss")
            const {name, message, room} = data;
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
            const {name,room} = data    
            const room_index = get_room_index(room)
            console.log(data)
            if (data.room != '') {
                if(room_index == -1) {
                    setting_room(room)
                    add_player(room,name)
                    socket.emit('joingame',{code: 200, player: game_room[room_index].player})
                    socket.join(room)
                }
                else {
                    add_player(room,name)
                    socket.emit('joingame',{code: 200, player: game_room[room_index].player})
                    socket.join(room)
                }
            }
            else{
                console.log('빈 값이 입력되었습니다.')
            }         
        })

        socket.on('ready',(data) => {
            const {name,room} = data
            const room_index = get_room_index(room)
            const player_index = game_room[room_index].findIndex(item => item.name == name)
            var Imready
            if(game_room[room_index].player[player_index].ready == true) {
                game_room[room_index].player[player_index].ready = false
                Imready = game_room[room_index].player[player_index].ready
            }
            else {
                game_room[room_index].player[player_index].ready = true
                Imready = game_room[room_index].player[player_index].ready
            }
            const vaild = game_room[room_index].player.findIndex(item => item.ready == false)
            const everyone_ready = false
            if(vaild == -1) everyone_ready = true            
            socket.to(room).emit('ready',{ready: Imready, everyone_ready: everyone_ready, player: game_room[room_index].player}) // 모두 레디를 한지 여부(t/f)
            console.log(Imready,everyone_ready)
        })

        socket.on('startgame',(data) => {
            const room = data.room
            const room_index = get_room_index(room)
            game_start(room)
            socket.to(room).emit('startgame', game_room[room_index])
            console.log('게임시작됨')
        })

        socket.on('choosemonster',(data) => {
            const room = data.room
            const room_index = get_room_index(room)
            choose_monster(room)
            socket.to(room).emit('choosemoster',game_room[room_index])
        })

        socket.on('move',(data) => {
            /** destination: 움직일 맵의 이름 */
            const {name, destination, room} = data
            const room_index = get_room_index(room)
            const player_index = game_room[room_index].findIndex(item => item.name == name)
            let destination_index = map_name_to_index(room,destination)
            move_room(room,game_room[room_index].player[player_index].player_num,destination_index)
            socket.to(room).emit('move', game_room[room_index])            
        })        

        socket.on('lockdoor',(data)=>{
            /** location: 맵 이름 */
            const {location, room} = data
            const room_index = get_room_index(room)
            let location_idx = map_name_to_index(room,location)
            lock_door(location_idx) //잠겨져 있으면 잠금해제, 열려있으면 잠금
            socket.emit('lockdoor', game_room[room_index])
        })

        socket.on('fixgenerator',(data)=>{
            /** location: 이름 key는 미션 성공 여부 */
            const {location, key, room} = data
            let gen_idx = is_mainroom(room,location)
            fix_generator(room,gen_idx,key)
        })

        socket.on('allmapinfo',(data) => {
            const {room} = data
            const room_index = get_room_index(room)
            socket.to(room).emit('allmapinfo', game_room[room_index].map)
        })
        socket.on('allplayerinfo',(data) => {
            const {room} = data
            const room_index = get_room_index(room)
            socket.to(room).emit('allplayerinfo', game_room[room_index].player)
        })

        socket.on('playerinfo',(data) => {
            const {room, name} = data
            const room_index = get_room_index(room)
            const player_index = game_room[room_index].findIndex(item => item.name == name)
            if (player_index != -1) {
                socket.to(room).emit('playerinfo', game_room[room_index].player[player_index])
            }
            else console.log('socket-playerinfo: 그런 사용자 없음.')
        })

        socket.on('leavegame',(data) => {
            let {name, room} = data            
            if (data.room != '') {
                const room_index = get_room_index(room)
                const player_index = game_room[room_index].findIndex(item => item.name == name)
                game_room[room_index].player.splice(player_index,1)
                socket.leave(room)
                io.to(room).emit('leave',{player: player})
                console.log(room+'번 방 leave 완료!')
            }
            else{
                console.log('value is empty!')
            }
        })
    })
}
