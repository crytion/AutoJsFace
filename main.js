//1, 请求权限
auto();
alert("项目启动,在人脸界面按音量下键检测");
if (!requestScreenCapture())
{
    toast("请求截图失败，请打开截图权限后使用");
    exit();
}

//2, 监听音量减键
events.setKeyInterceptionEnabled("volume_down", true);
events.observeKey();
events.onKeyDown("volume_down", function (event)
{
    toast("识别中..");
 
    ChoosePic();
});

//3, 截图并上传
let ChoosePic = function ()
{
    var img = captureScreen();
    var imgBase64 = images.toBase64(img, "jpg", 100);
    PostFaceData(imgBase64);
}

//4, 上传后打印出回应
let PostFaceData = function(base64str)
{
    var postData = {
        "api_key": "X5CYnsaJJCgMJXMPo9JGyHWfsqWx80gr",
        "api_secret": "K1zHwlcl1RalyoLOH3vWLsouLDjPcl69",
        "return_attributes": "gender,age,smiling,facequality,beauty,skinstatus,emotion,skinstatus,blur"
    };
    
    postData.image_base64 = base64str;

    // console.log("=====" + JSON.stringify(postData));
    var strbody = http.post('https://api-cn.faceplusplus.com/facepp/v3/detect',postData);
    strbody = strbody.body.string();
    //console.log('Upload successful!', strbody);
    CallBack(strbody);
};

let CallBack = function(strbody)
{
    let strResult = FaceResult(JSON.parse(strbody));
    //console.log('strResult!== ',strResult);

    alert(strResult);
}


/**
 * @return {string}
 */
let FaceResult = function(body)
{
    let nNum = body.face_num;
    if (nNum <= 0)
    {
        return "图片中没有人脸";
    }
    if (nNum > 1)
    {
        return "人物过多,请剪切图片";
    }

    let faceArr = body.faces;

    for (let i in faceArr)
    {
        let oneFace = faceArr[i];
        let attributes = oneFace.attributes;

        //console.log("attributes=== " + JSON.stringify(attributes));

        let bMan = false;
        if (attributes.gender.value == "Female")
        {
            bMan = false;
        }
        else
        {
            bMan = true;
        }

        let blur = attributes.blur.blurness.value >= attributes.blur.blurness.threshold;

        let nAge = attributes.age.value;
        let bSmile = attributes.smile.value >= attributes.smile.threshold;
        let nBeauty = bMan ? attributes.beauty.male_score : attributes.beauty.female_score;
        let strBeauty = "没及格";
        if (nBeauty >= 80)
        {
            strBeauty = "较高"
        } else if (nBeauty >= 60)
        {
            strBeauty = "还行"
        }


        let emotion = attributes.emotion;
        let strEmotion = "普通";
        if (emotion.anger > 40)
        {
            strEmotion = "愤怒";
        }
        if (emotion.disgust > 40)
        {
            strEmotion = "厌恶";
        }
        if (emotion.fear > 40)
        {
            strEmotion = "恐惧";
        }
        if (emotion.happiness > 40)
        {
            strEmotion = "高兴";
        }
        if (emotion.neutral > 40)
        {
            strEmotion = "平静";
        }
        if (emotion.sadness > 40)
        {
            strEmotion = "伤心";
        }
        if (emotion.surprise > 40)
        {
            strEmotion = "惊讶";
        }

        let skinstatus = attributes.skinstatus;
        let strSkinstatus = "皮肤健康度=" + skinstatus.health + " 色斑度=" + skinstatus.stain + " 青春痘可能性=" + skinstatus.acne + "% 黑眼圈可能性=" + skinstatus.dark_circle + "%";


        return "" + (blur ? "这张图不怎么清楚.." : "图片清晰度正常..") + "这个人是" + (bMan ? "男性" : "女性") + "" + (bSmile ? ", 正在笑" : "") + ", 年龄是" + nAge + "岁左右," +
            " 颜值为" + nBeauty.toFixed(1) + ' ' + strBeauty + ", 表情是" + strEmotion
            + " \n" + strSkinstatus;
    }
};