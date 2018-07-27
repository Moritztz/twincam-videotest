//'use strict';    //�g��Ȃ��Ă������� ���������������`�F�b�N������́B����ƃo�O���N���ɂ����Ȃ�₷���B�炵��

let localStream = null;
let peer = null;
let existingCall = null;
let isReceive = false;    //��M��p���ǂ���
const VIDEO_CODEC = 'VP9';

let videoTrack;
let capabilities;
let constraints;
let settings;

//�J�����f���A�}�C�N�����̎擾
function getmedia(video_option) {
    //�Z�b�g����Ă��鎩���̃r�f�I���폜
    $('#my-video').get(0).srcObject = undefined;
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false }, video: true })
        .then(function (stream) {
            // Success
            videoTrack = stream.getVideoTracks()[0];           //MediaStream����[0]�Ԗڂ�Video��MediaStreamTrack���擾
            capabilities = videoTrack.getCapabilities();       //�ݒ�\�Ȓl�͈̔�
            videoTrack.applyConstraints(video_option)
                .then(() => {                                  //�l��ݒ�
                    constraints = videoTrack.getConstraints(); //�ݒ肵���l
                    settings = videoTrack.getSettings();       //�ݒ肳�ꂽ�l
                    stream.addTrack(videoTrack);               //�ݒ肵�������ǉ�
                }).catch((err) => {
                    console.error('applyConstraints() error:', err);
                });
            $('#my-video').get(0).srcObject = stream;          //�ݒ肵���������ʂɃZ�b�g
            localStream = stream;                              //���M�p�ɃL�[�v
        }).catch(function (error) {
            // Error
            console.error('mediaDevice.getUserMedia() error:', error);
            return;
        });
}

//�w�肵���𑜓x�̉f�����擾
$('#4K').click(function () {
    getmedia({ width: { ideal: 3840 }, height: { ideal: 1920 }, frameRate: { ideal: 30 } });
});

$('#FullHD').click(function () {
    getmedia({ width: { ideal: 1920 }, height: { ideal: 960 }, frameRate: { ideal: 30 } });
});

$('#960').click(function () {
    getmedia({ width: { ideal: 960 }, height: { ideal: 480 }, frameRate: { ideal: 15 } });
});

$('#480').click(function () {
    getmedia({ width: { ideal: 480 }, height: { ideal: 240 }, frameRate: { ideal: 10 } });
});

$('#240').click(function () {
    getmedia({ width: { ideal: 240 }, height: { ideal: 120 }, frameRate: { ideal: 5 } });
});

$('#Resolution').submit(function (e) {
    e.preventDefault();
    getmedia({ width: { ideal: $('#width').val() }, height: { ideal: $('#height').val() }, frameRate: { ideal: $('#framerate').val() } });
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