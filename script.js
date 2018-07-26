//'use strict';    //�g��Ȃ��Ă������� ���������������`�F�b�N������́B����ƃo�O���N���ɂ����Ȃ�₷���B�炵��

var localStream = null;
var peer = null;
let existingCall = null;
var isReceive = false;    //��M��p���ǂ���
const VIDEO_CODEC = 'VP9';

let testStream;
let capabilities;

//�J�����f���A�}�C�N�����̎擾
function getmedia(video_option) {
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false }, video: video_option })
        .then(function (stream) {
            // Success
            $('#my-video').get(0).srcObject = stream;
            localStream = stream;
            testStream = stream.getVideoTracks(); //a
            capabilities = testStream[0].getCapabilities();
        }).catch(function (error) {
            // Error
            console.error('mediaDevice.getUserMedia() error:', error);
            return;
        });
}

//4K�f�����擾
$('#4K').click(function () {
    getmedia({ width: { ideal: 3840 }, height: { ideal: 1920 }, frameRate: { ideal: 30 } });
});

//FullHD�f�����擾
$('#FullHD').click(function () {
    getmedia(true);
});

$('#Low').click(function () {
    getmedia({ width: 960 , height: 480 , frameRate: { ideal: 15 } });
});

$('#LowLow').click(function () {
    //getmedia({ width: 480, height: 240, frameRate: { ideal: 15 } });
    getmedia({
        "optional": [{ "width": { "max": 480 } },
        { "height": { "max": 240 } }]
    });
});

$('#LowLowLow').click(function () {
    getmedia({ width: 240, height: 120, frameRate: { ideal: 5 } });
});

//peerid���擾
function getpeerid(id) {
    //�{�^�������ׂď����@PeerID���T�[�o�[�Ɏc���Ă��܂����������ł��Ȃ�
    $('#peerid-ui').hide();

    //peer�I�u�W�F�N�g�̍쐬
    peer = new Peer(id,{
        key: '9373b614-604f-4fd5-b96a-919b20a7c24e',    //APIkey
        debug: 3
    });

    start();//�C�x���g�m�F
}

//peerid�̑I��
$('#twincam1').click(function () {
    getpeerid("tc1");
    $('#callto-id').val("user1");
});

$('#twincam2').click(function () {
    getpeerid("tc2");
    $('#callto-id').val("user2");
});

$('#twincam3').click(function () {
    getpeerid("tc3");
    $('#callto-id').val("user3");
});

$('#twincam4').click(function () {
    getpeerid("tc4");
    $('#callto-id').val("user4");
});

$('#user1').click(function () {
    getpeerid("user1");
    $('#callto-id').val("tc1");
    isReceive = true;
});

$('#user2').click(function () {
    getpeerid("user2");
    $('#callto-id').val("tc2");
    isReceive = true;
});

$('#user3').click(function () {
    getpeerid("user3");
    $('#callto-id').val("tc3");
    isReceive = true;
});

$('#user4').click(function () {
    getpeerid("user4");
    $('#callto-id').val("tc4");
    isReceive = true;
});

$('#recieve').click(function () {
    getpeerid(null);
    $('#callto-id').val("tc");
    isReceive = true;
});

$('#random').click(function () {
    getpeerid(null);
});

//reload�{�^��
$('#reload').click(function () {
    location.reload(true);
});

//���M����
$('#make-call').submit(function (e) {
    e.preventDefault();
    const call = peer.call($('#callto-id').val(), localStream, {
        videoCodec: VIDEO_CODEC,
        videoReceiveEnabled: isReceive,
        audioReceiveEnabled: isReceive,
    });
    setupCallEventHandlers(call);
});

//�ؒf����
$('#end-call').click(function () {
    existingCall.close();
});

//�C�x���g id�擾�ザ��Ȃ��Ɠ��삵�Ȃ�
function start() {
    //open�C�x���g
    peer.on('open', function () {
        $('#my-id').text(peer.id);
    });

    //error�C�x���g
    peer.on('error', function (err) {
        alert(err.message);
        setupMakeCallUI();
    });

    //close�C�x���g
    peer.on('close', function () {
        alert(err.message);
        setupMakeCallUI();
    });

    //disconnected�C�x���g
    peer.on('disconnected', function () {
        alert(err.message);
        setupMakeCallUI();
    });

    //���M����
    peer.on('call', function (call) {
        call.answer(localStream, { videoCodec: VIDEO_CODEC });
        setupCallEventHandlers(call);
    });
}

//Call�I�u�W�F�N�g�ɕK�v�ȃC�x���g
function setupCallEventHandlers(call) {
    if (existingCall) {
        existingCall.close();
    };

    existingCall = call;

    setupEndCallUI(call);

    call.on('stream', function (stream) {
        addVideo(call, stream);
    });

    call.on('close', function () {    //??�Ȃ������s���ꂽ���Ŕ��΂���??
        removeVideo(call.remoteId);
        setupMakeCallUI();
    });
}

//video�v�f�̍Đ�
function addVideo(call, stream) {
    $('#their-video').get(0).srcObject = stream;
}

//video�v�f�̍폜
function removeVideo(peerId) {
    $('#their-video').get(0).srcObject = undefined;
}

//�{�^���̕\��
function setupMakeCallUI() {
    $('#make-call').show();
    $('#end-call-ui').hide();
}

//�{�^����\���؂�ւ�
function setupEndCallUI(call) {
    $('#make-call').hide();
    $('#end-call-ui').show();
    $('#their-id').text(call.remoteId);
}