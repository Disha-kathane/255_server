const Queue = require('bull');
const semaphore = require('semaphore');
const redisHost = require('../constant').redisHost;
const redisPort = require('../constant').redisPort;
const QUEUE_SIZE = require('../constant').QUEUE_SIZE;
const SMALL_CAMPAIGN_THRESHOLD = require('../constant').SMALL_CAMPAIGN_THRESHOLD;
const queuename6 = require('../constant').queuename6;
let mysql = require('../database/db');

const redis = {
    redis: {
        host: redisHost,
        port: redisPort
    }
};

function fetchPlaceholders(placeholders) {
    var placeholderArr = JSON.parse(placeholders);
    var tempArr = [];
    for (var i = 0; i < placeholderArr.length; i++) {
        tempArr.push({
            "type": "text",
            "text": placeholderArr[i] != null ? placeholderArr[i].toString() : ''
        });
    }

    return tempArr;
}

function fetchPlaceholders11(placeholderArr) {
    var tempArr11 = [];
    for (var i = 0; i < placeholderArr.length; i++) {
        tempArr11.push({
            "type": "text",
            "text": placeholderArr[i] != null ? placeholderArr[i].toString() : ''
        });
    }
    return tempArr11;
}


module.exports.createpayload = async (mid, TPS_Payload, contactno, msgcount) => {
    let limits = {
        limiter: {
            max: TPS_Payload,
            duration: 1000,
            bounceBack: false
        }
    };
    let queuename = null;
    if (msgcount <= SMALL_CAMPAIGN_THRESHOLD) {
        queuename = queuename6;
    } else {
        queuename = Math.floor(Math.random() * QUEUE_SIZE) + 1;
        queuename = 'QUEUE-' + queuename;
    }



    // let threadsqueue = new Queue(contactno, limits);
    const threadsqueue = new Queue(queuename, redis, limits);

    console.log('LIMITS ===============>' + JSON.stringify(limits.limiter));
    let temid = [];

    for (let j = 0; j < mid.length; j++) {

        console.log(' j ============>' + [j]);

        mid[j].mobileno = mid[j].mobileno.replace(/\+/g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\'/g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\ /g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\-/g, '');
        mid[j].mobileno = mid[j].mobileno.replace(/\//g, '');


        let bodyContent = null;
        let objMsg = null;
        let c = 0;

        if (mid[j].placeholders != null) {
            let _x = mid[j].placeholders.toString().indexOf("'[");
            if (_x == 0) {
                mid[j].placeholders = mid[j].placeholders.toString().replace("'[", "[");
            }

            _x = mid[j].placeholders.toString().lastIndexOf("]'");
            if (_x != -1) {
                mid[j].placeholders = mid[j].placeholders.toString().replace("]'", "]");
            }
        }

        switch (mid[j].messagetype) {

            case 0: // DOCUMENT
                if (mid[j].mediaflag == 1) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);

                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "document",
                                        "document": {
                                            "id": mid[j].media,
                                            "caption": "",
                                            "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //  "policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "document",
                                        "document": {
                                            "id": mid[j].media,
                                            "caption": "",
                                            "filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }

                    if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                        let k = 0;
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; i++) {
                            if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                let tempArr = [];
                                tempArr.push({
                                    "type": "text",
                                    "text": callToActionArr[i].call_phone.phone_button_text
                                });
                            }
                            if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "url",
                                    //"index": i + 1,
                                    "index": i,
                                    "parameters": tempArr
                                };

                                if (callToActionArr[i].visit_website.web_url_option == 1) {

                                    let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                    tempArr.push({
                                        "type": "text",
                                        "text": messageObj[c]
                                    });
                                    k++;
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                    c++;
                                }

                            }

                            if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "quick_reply",
                                    "index": i,
                                    "parameters": tempArr
                                };
                                //   console.log(tempArr);

                                tempArr.push({
                                    "type": "payload",
                                    "payload": callToActionArr[i].quick_reply
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                            if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "copy_code",
                                    "index": i,
                                    "parameters": tempArr
                                };
                                //   console.log(tempArr);

                                tempArr.push({
                                    "type": "coupon_code",
                                    "coupon_code": mid[j].offer_code_placeholder
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                        }

                    }


                }
                if (mid[j].mediaflag == 2) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);
                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "document",
                                        "document": {
                                            "link": mid[j].media,
                                            "caption": "",
                                            "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "document",
                                        "document": {
                                            "link": mid[j].media,
                                            "caption": "",
                                            "filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }


                    if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                        let k = 0;
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; i++) {
                            if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                let tempArr = [];
                                tempArr.push({
                                    "type": "text",
                                    "text": callToActionArr[i].call_phone.phone_button_text
                                });
                            }
                            if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "url",
                                    //"index": i + 1,
                                    "index": i,
                                    "parameters": tempArr
                                };

                                if (callToActionArr[i].visit_website.web_url_option == 1) {

                                    let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                    tempArr.push({
                                        "type": "text",
                                        "text": messageObj[c]
                                    });
                                    k++;
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                    c++;
                                }

                            }

                            if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "quick_reply",
                                    "index": i,
                                    "parameters": tempArr
                                };

                                tempArr.push({
                                    "type": "payload",
                                    "payload": callToActionArr[i].quick_reply
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                            if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "copy_code",
                                    "index": i,
                                    "parameters": tempArr
                                };

                                tempArr.push({
                                    "type": "coupon_code",
                                    "coupon_code": mid[j].offer_code_placeholder
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                            // }
                        }

                    }
                }
                break;
            case 1: // IMAGE

                if (mid[j].mediaflag == 1) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);

                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "image",
                                        "image": {
                                            "id": mid[j].media,
                                            "caption": ""
                                            // "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };

                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "image",
                                        "image": {
                                            "id": mid[j].media,
                                            "caption": ""
                                            //"filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }
                    if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                        let k = 0;
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; i++) {
                            if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                let tempArr = [];
                                tempArr.push({
                                    "type": "text",
                                    "text": callToActionArr[i].call_phone.phone_button_text
                                });
                            }
                            if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "url",
                                    //"index": i + 1,
                                    "index": i,
                                    "parameters": tempArr
                                };

                                if (callToActionArr[i].visit_website.web_url_option == 1) {
                                    console.log('DYNAMIC_URL_PLACEHOLDER : ' + mid[j].dynamic_url_placeholder);
                                    let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                    tempArr.push({
                                        "type": "text",
                                        "text": messageObj[c]
                                    });
                                    k++;
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                    c++;
                                }

                            }

                            if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "quick_reply",
                                    "index": i,
                                    "parameters": tempArr
                                };
                                //   console.log(tempArr);

                                tempArr.push({
                                    "type": "payload",
                                    "payload": callToActionArr[i].quick_reply
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                            if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {

                                console.log('mid j ============>' + JSON.stringify(mid[j]));
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "copy_code",
                                    "index": i,
                                    "parameters": tempArr
                                };
                                //   console.log(tempArr);

                                tempArr.push({
                                    "type": "coupon_code",
                                    "coupon_code": mid[j].offer_code_placeholder
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                            // }
                        }

                    }
                }
                if (mid[j].mediaflag == 2) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);
                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "image",
                                        "image": {
                                            "link": mid[j].media,
                                            "caption": ""
                                            // "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    // "policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "image",
                                        "image": {
                                            "link": mid[j].media,
                                            "caption": ""
                                            //"filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }

                    if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                        let k = 0;
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; i++) {
                            if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                let tempArr = [];
                                tempArr.push({
                                    "type": "text",
                                    "text": callToActionArr[i].call_phone.phone_button_text
                                });
                            }
                            if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "url",
                                    //"index": i + 1,
                                    "index": i,
                                    "parameters": tempArr
                                };

                                if (callToActionArr[i].visit_website.web_url_option == 1) {

                                    let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                    tempArr.push({
                                        "type": "text",
                                        "text": messageObj[c]
                                    });
                                    k++;
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                    c++;
                                }

                            }

                            if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "quick_reply",
                                    "index": i,
                                    "parameters": tempArr
                                };

                                tempArr.push({
                                    "type": "payload",
                                    "payload": callToActionArr[i].quick_reply
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                            if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "copy_code",
                                    "index": i,
                                    "parameters": tempArr
                                };

                                tempArr.push({
                                    "type": "coupon_code",
                                    "coupon_code": mid[j].offer_code_placeholder
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                        }

                    }
                }
                break;
            case 2: // VIDEO

                if (mid[j].mediaflag == 1) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);

                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;

                        }
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    // "policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "video",
                                        "video": {
                                            "id": mid[j].media
                                            // "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "video",
                                        "video": {
                                            "id": mid[j].media
                                            //"filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }

                    if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                        let k = 0;
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; i++) {
                            if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                let tempArr = [];
                                tempArr.push({
                                    "type": "text",
                                    "text": callToActionArr[i].call_phone.phone_button_text
                                });
                            }
                            if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "url",
                                    //"index": i + 1,
                                    "index": i,
                                    "parameters": tempArr
                                };

                                if (callToActionArr[i].visit_website.web_url_option == 1) {

                                    let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                    tempArr.push({
                                        "type": "text",
                                        "text": messageObj[c]
                                    });
                                    k++;
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                    c++;
                                }

                            }

                            if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "quick_reply",
                                    "index": i,
                                    "parameters": tempArr
                                };

                                tempArr.push({
                                    "type": "payload",
                                    "payload": callToActionArr[i].quick_reply
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                            if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "copy_code",
                                    "index": i,
                                    "parameters": tempArr
                                };

                                tempArr.push({
                                    "type": "coupon_code",
                                    "coupon_code": mid[j].offer_code_placeholder
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }

                        }

                    }
                }
                if (mid[j].mediaflag == 2) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);
                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "video",
                                        "video": {
                                            "link": mid[j].media
                                            // "filename": mid[j].filename
                                        }
                                    }]
                                },
                                {
                                    "type": "body",
                                    "parameters": tempArr
                                }
                                ]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "header",
                                    "parameters": [{
                                        "type": "video",
                                        "video": {
                                            "link": mid[j].media
                                            // "filename": mid[j].filename
                                        }
                                    }]
                                }]
                            }
                        };
                    }
                    if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                        let k = 0;
                        let callToActionArr = JSON.parse(mid[j].button_option_string);
                        for (let i = 0; i < callToActionArr.length; i++) {
                            if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                let tempArr = [];
                                tempArr.push({
                                    "type": "text",
                                    "text": callToActionArr[i].call_phone.phone_button_text
                                });
                            }
                            if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "url",
                                    //"index": i + 1,
                                    "index": i,
                                    "parameters": tempArr
                                };
                                if (callToActionArr[i].visit_website.web_url_option == 1) {

                                    let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                    tempArr.push({
                                        "type": "text",
                                        "text": messageObj[c]
                                    });
                                    k++;
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                    c++;
                                }

                            }

                            if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "quick_reply",
                                    "index": i,
                                    "parameters": tempArr
                                };
                                //   console.log(tempArr);

                                tempArr.push({
                                    "type": "payload",
                                    "payload": callToActionArr[i].quick_reply
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }
                            if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                let tempArr = [];
                                let component_button = {
                                    "type": "button",
                                    "sub_type": "copy_code",
                                    "index": i,
                                    "parameters": tempArr
                                };

                                tempArr.push({
                                    "type": "coupon_code",
                                    "coupon_code": mid[j].offer_code_placeholder
                                });
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                            }

                        }

                    }
                }
                break;
            case 4: //TEXT MESSAGE

                if (mid[j].mediaflag == 0) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);

                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "body",
                                    "parameters": tempArr
                                }]
                            }
                        };
                    } else {

                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": []
                            }
                        };
                    }
                    if (mid[j].placeholder_template_type == 1) {
                        let tmpHeader = {
                            "type": "header",
                            "parameters": [{
                                "type": "text",
                                "text": mid[j].header_placeholder
                            }]
                        };
                        if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                            let k = 0;
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; i++) {
                                if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                    let tempArr = [];
                                    tempArr.push({
                                        "type": "text",
                                        "text": callToActionArr[i].call_phone.phone_button_text
                                    });
                                }
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        //"index": i + 1,
                                        "index": i,
                                        "parameters": tempArr
                                    };

                                    if (callToActionArr[i].visit_website.web_url_option == 1) {

                                        let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                        tempArr.push({
                                            "type": "text",
                                            "text": messageObj[c]
                                        });
                                        k++;
                                        component_button.parameters = tempArr;
                                        objMsg.template.components.push(component_button);
                                        c++;
                                    }

                                }

                                if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "quick_reply",
                                        "index": i,
                                        "parameters": tempArr
                                    };

                                    tempArr.push({
                                        "type": "payload",
                                        "payload": callToActionArr[i].quick_reply
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                                if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "copy_code",
                                        "index": i,
                                        "parameters": tempArr
                                    };

                                    tempArr.push({
                                        "type": "coupon_code",
                                        "coupon_code": mid[j].offer_code_placeholder
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }

                                if (callToActionArr[i].launch_catalogue != null && callToActionArr[i].launch_catalogue != undefined) {
                                    let catalogArr = JSON.parse(mid[j].catalog_payload);
                                    let buttonOptionString12 = mid[j].button_option_string;
                                    let buttonOptions12 = JSON.parse(buttonOptionString12);
                                    let catalogueButtonText = buttonOptions12[0].launch_catalogue.catalogue_button_text;
                                    if (catalogueButtonText == "View catalog") {
                                        let component_button = {

                                            "type": "button",
                                            "sub_type": "CATALOG",
                                            "index": i,
                                            "parameters": [
                                                {
                                                    "type": "action",
                                                    "action": {
                                                        "thumbnail_product_retailer_id": catalogArr.thumbnail_product_retailer_id
                                                    }
                                                }
                                            ]

                                        };
                                        objMsg.template.components.push(component_button);


                                    } else if (catalogueButtonText == "View items") {
                                        let component_button = {

                                            "type": "button",
                                            "sub_type": "mpm",
                                            "index": i,
                                            "parameters": [
                                                {
                                                    "type": "action",
                                                    "action": catalogArr

                                                }

                                            ]

                                        };
                                        objMsg.template.components.push(component_button);
                                    }

                                }
                            }

                        }
                        objMsg.template.components.push(tmpHeader);
                    }
                    if (mid[j].placeholder_template_type == 2) {
                        let tmpHeader = {
                            "type": "header",
                            "parameters": [{
                                "type": "text",
                                "text": mid[j].header_placeholder
                            }]
                        };

                        objMsg.template.components.push(tmpHeader);
                    }
                    if (mid[j].placeholder_template_type == 2) {
                        if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                            let tempArr = [];
                            tempArr.push({
                                "type": "text",
                                "text": callToActionArr[i].call_phone.phone_button_text
                            });
                        }
                        if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                            let tempArr = [];
                            let component_button = {
                                "type": "button",
                                "sub_type": "url",
                                //"index": i + 1,
                                "index": i,
                                "parameters": tempArr
                            };

                            if (callToActionArr[i].visit_website.web_url_option == 1) {

                                let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                tempArr.push({
                                    "type": "text",
                                    "text": messageObj[c]
                                });
                                k++;
                                component_button.parameters = tempArr;
                                objMsg.template.components.push(component_button);
                                c++;
                            }
                        }

                        if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                            let tempArr = [];
                            let component_button = {
                                "type": "button",
                                "sub_type": "quick_reply",
                                "index": i,
                                "parameters": tempArr
                            };

                            tempArr.push({
                                "type": "payload",
                                "payload": callToActionArr[i].quick_reply
                            });
                            component_button.parameters = tempArr;
                            objMsg.template.components.push(component_button);
                        }
                        if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                            let tempArr = [];
                            let component_button = {
                                "type": "button",
                                "sub_type": "copy_code",
                                "index": i,
                                "parameters": tempArr
                            };

                            tempArr.push({
                                "type": "coupon_code",
                                "coupon_code": mid[j].offer_code_placeholder
                            });
                            component_button.parameters = tempArr;
                            objMsg.template.components.push(component_button);
                        }
                        if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; i++) {

                                if (callToActionArr[i].launch_catalogue != null && callToActionArr[i].launch_catalogue != undefined) {
                                    let catalogArr = JSON.parse(mid[j].catalog_payload);
                                    let buttonOptionString12 = mid[j].button_option_string;
                                    let buttonOptions12 = JSON.parse(buttonOptionString12);
                                    let catalogueButtonText = buttonOptions12[0].launch_catalogue.catalogue_button_text;
                                    if (catalogueButtonText == "View catalog") {
                                        //   console.log("insoieedd cataloog button");
                                        let component_button = {

                                            "type": "button",
                                            "sub_type": "CATALOG",
                                            "index": i,
                                            "parameters": [
                                                {
                                                    "type": "action",
                                                    "action": {
                                                        "thumbnail_product_retailer_id": catalogArr.thumbnail_product_retailer_id
                                                    }
                                                }
                                            ]

                                        };
                                        objMsg.template.components.push(component_button);


                                    } else if (catalogueButtonText == "View items") {
                                        let component_button = {

                                            "type": "button",
                                            "sub_type": "mpm",
                                            "index": i,
                                            "parameters": [
                                                {
                                                    "type": "action",
                                                    "action": catalogArr

                                                }

                                            ]

                                        };
                                        objMsg.template.components.push(component_button);
                                    }

                                }
                            }

                        }

                    }



                    if (mid[j].placeholder_template_type == 3) {
                        if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                            let k = 0;
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; i++) {

                                if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                    let tempArr = [];
                                    tempArr.push({
                                        "type": "text",
                                        "text": callToActionArr[i].call_phone.phone_button_text
                                    });
                                }
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        //"index": i + 1,
                                        "index": i,
                                        "parameters": tempArr
                                    };

                                    if (callToActionArr[i].visit_website.web_url_option == 1) {

                                        let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                        tempArr.push({
                                            "type": "text",
                                            "text": messageObj[c]
                                        });
                                        k++;
                                        component_button.parameters = tempArr;
                                        objMsg.template.components.push(component_button);
                                        c++;
                                    }

                                }

                                if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "quick_reply",
                                        "index": i,
                                        "parameters": tempArr
                                    };

                                    tempArr.push({
                                        "type": "payload",
                                        "payload": callToActionArr[i].quick_reply
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                                if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "copy_code",
                                        "index": i,
                                        "parameters": tempArr
                                    };

                                    tempArr.push({
                                        "type": "coupon_code",
                                        "coupon_code": mid[j].offer_code_placeholder
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                                if (callToActionArr[i].launch_catalogue != null && callToActionArr[i].launch_catalogue != undefined) {
                                    let catalogArr = JSON.parse(mid[j].catalog_payload);
                                    let buttonOptionString12 = mid[j].button_option_string;
                                    let buttonOptions12 = JSON.parse(buttonOptionString12);
                                    let catalogueButtonText = buttonOptions12[0].launch_catalogue.catalogue_button_text;
                                    if (catalogueButtonText == "View catalog") {
                                        //   console.log("insoieedd cataloog button");
                                        let component_button = {

                                            "type": "button",
                                            "sub_type": "CATALOG",
                                            "index": i,
                                            "parameters": [
                                                {
                                                    "type": "action",
                                                    "action": {
                                                        "thumbnail_product_retailer_id": catalogArr.thumbnail_product_retailer_id
                                                    }
                                                }
                                            ]

                                        };
                                        //   console.log(component_button);
                                        objMsg.template.components.push(component_button);


                                    } else if (catalogueButtonText == "View items") {
                                        //   console.log("insoieedd mpm button");
                                        let component_button = {

                                            "type": "button",
                                            "sub_type": "mpm",
                                            "index": i,
                                            "parameters": [
                                                {
                                                    "type": "action",
                                                    "action": catalogArr

                                                }

                                            ]

                                        };
                                        //   console.log(component_button);
                                        objMsg.template.components.push(component_button);
                                    }

                                }
                            }

                        }
                    }


                    if (mid[j].placeholder_template_type == 4) {
                        if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                            let k = 0;
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; i++) {
                                if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                    let tempArr = [];
                                    tempArr.push({
                                        "type": "text",
                                        "text": callToActionArr[i].call_phone.phone_button_text
                                    });
                                }
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        //"index": i + 1,
                                        "index": i,
                                        "parameters": tempArr
                                    };

                                    if (callToActionArr[i].visit_website.web_url_option == 1) {

                                        let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                        tempArr.push({
                                            "type": "text",
                                            "text": messageObj[c]
                                        });
                                        k++;
                                        component_button.parameters = tempArr;
                                        objMsg.template.components.push(component_button);
                                        c++;
                                    }

                                }

                                if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "quick_reply",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    // console.log(tempArr);

                                    tempArr.push({
                                        "type": "payload",
                                        "payload": callToActionArr[i].quick_reply
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                                if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "copy_code",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    // console.log(tempArr);

                                    tempArr.push({
                                        "type": "coupon_code",
                                        "coupon_code": mid[j].offer_code_placeholder
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                                if (callToActionArr[i].launch_catalogue != null && callToActionArr[i].launch_catalogue != undefined) {
                                    let catalogArr = JSON.parse(mid[j].catalog_payload);
                                    let buttonOptionString12 = mid[j].button_option_string;
                                    let buttonOptions12 = JSON.parse(buttonOptionString12);
                                    let catalogueButtonText = buttonOptions12[0].launch_catalogue.catalogue_button_text;
                                    if (catalogueButtonText == "View catalog") {
                                        //   console.log("insoieedd cataloog button");
                                        let component_button = {

                                            "type": "button",
                                            "sub_type": "CATALOG",
                                            "index": i,
                                            "parameters": [
                                                {
                                                    "type": "action",
                                                    "action": {
                                                        "thumbnail_product_retailer_id": catalogArr.thumbnail_product_retailer_id
                                                    }
                                                }
                                            ]

                                        };
                                        //   console.log(component_button);
                                        objMsg.template.components.push(component_button);


                                    } else if (catalogueButtonText == "View items") {
                                        //   console.log("insoieedd mpm button");
                                        let component_button = {

                                            "type": "button",
                                            "sub_type": "mpm",
                                            "index": i,
                                            "parameters": [
                                                {
                                                    "type": "action",
                                                    "action": catalogArr

                                                }

                                            ]

                                        };
                                        //   console.log(component_button);
                                        objMsg.template.components.push(component_button);
                                    }

                                }
                                // }
                            }

                        }
                    }
                    if (mid[j].placeholder_template_type == 5) {
                        if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                            let k = 0;
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; i++) {

                                if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                    let tempArr = [];
                                    tempArr.push({
                                        "type": "text",
                                        "text": callToActionArr[i].call_phone.phone_button_text
                                    });
                                }
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        //"index": i + 1,
                                        "index": i,
                                        "parameters": tempArr
                                    };

                                    if (callToActionArr[i].visit_website.web_url_option == 1) {

                                        let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                        tempArr.push({
                                            "type": "text",
                                            "text": messageObj[c]
                                        });
                                        k++;
                                        component_button.parameters = tempArr;
                                        objMsg.template.components.push(component_button);
                                        c++;
                                    }

                                }

                                if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "quick_reply",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    // console.log(tempArr);

                                    tempArr.push({
                                        "type": "payload",
                                        "payload": callToActionArr[i].quick_reply
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                                if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "copy_code",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    // console.log(tempArr);

                                    tempArr.push({
                                        "type": "coupon_code",
                                        "coupon_code": mid[j].offer_code_placeholder
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                                if (callToActionArr[i].launch_catalogue != null && callToActionArr[i].launch_catalogue != undefined) {

                                    let catalogArr = JSON.parse(mid[j].catalog_payload);
                                    let buttonOptionString12 = mid[j].button_option_string;
                                    let buttonOptions12 = JSON.parse(buttonOptionString12);
                                    let catalogueButtonText = buttonOptions12[0].launch_catalogue.catalogue_button_text;
                                    if (catalogueButtonText == "View catalog") {
                                        //   console.log("insoieedd cataloog button");
                                        let component_button = {

                                            "type": "button",
                                            "sub_type": "CATALOG",
                                            "index": i,
                                            "parameters": [
                                                {
                                                    "type": "action",
                                                    "action": {
                                                        "thumbnail_product_retailer_id": catalogArr.thumbnail_product_retailer_id
                                                    }
                                                }
                                            ]

                                        };
                                        //   console.log(component_button);
                                        objMsg.template.components.push(component_button);


                                    } else if (catalogueButtonText == "View items") {
                                        //   console.log("insoieedd mpm button");
                                        let component_button = {

                                            "type": "button",
                                            "sub_type": "mpm",
                                            "index": i,
                                            "parameters": [
                                                {
                                                    "type": "action",
                                                    "action": catalogArr
                                                }

                                            ]

                                        };
                                        //   console.log(component_button);
                                        objMsg.template.components.push(component_button);
                                    }

                                }
                            }

                        }
                    }
                }
                break;
            case 5: //LOCATION

                if (mid[j].location_placeholder != null) {
                    let _x = mid[j].location_placeholder.toString().indexOf("'[");
                    if (_x == 0) {
                        mid[j].location_placeholder = mid[j].location_placeholder.toString().replace("'[", "[");
                    }

                    _x = mid[j].location_placeholder.toString().lastIndexOf("]'");
                    if (_x != -1) {
                        mid[j].location_placeholder = mid[j].location_placeholder.toString().replace("]'", "]");
                    }
                }

                let location = JSON.parse(mid[j].location_placeholder);
                let latitude = location[0];
                let longitude = location[1];
                let locationname = location[2];
                let locationaddress = location[3];

                if (mid[j].mediaflag == 0) {
                    if (mid[j].placeholders != '' && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);

                        let i = 1;
                        bodyContent = mid[j].body_message.toString();
                        for (let j = 0; j < tempArr.length; j++) {
                            let x = tempArr[j].text;
                            //console.log(x, '{{' + i + '}}');
                            bodyContent = bodyContent.replace('{{' + i + '}}', x);
                            i++;
                        }

                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": [{
                                    "type": "body",
                                    "parameters": tempArr
                                }]
                            }
                        };
                    } else {
                        bodyContent = mid[j].body_message.toString();
                        objMsg = {
                            "messaging_product": "whatsapp",
                            "recipient_type": "individual",
                            "to": mid[j].mobileno,
                            "type": "template",
                            "template": {
                                //"namespace": mid[j].namespace,
                                "language": {
                                    //"policy": "deterministic",
                                    "code": mid[j].language
                                },
                                "name": mid[j].templatetitle,
                                "components": []
                            }
                        };
                    }
                    if (mid[j].placeholder_template_type == 1) {
                        let tmpHeader = {
                            "type": "header",
                            "parameters": [{
                                "type": "location",
                                "location": {
                                    "latitude": latitude,
                                    "longitude": longitude,
                                    "name": locationname,
                                    "address": locationaddress
                                }
                            }]
                        };

                        if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                            let k = 0;
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; i++) {
                                if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                    let tempArr = [];
                                    tempArr.push({
                                        "type": "text",
                                        "text": callToActionArr[i].call_phone.phone_button_text
                                    });
                                }
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        //"index": i + 1,
                                        "index": i,
                                        "parameters": tempArr
                                    };

                                    if (callToActionArr[i].visit_website.web_url_option == 1) {

                                        let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                        tempArr.push({
                                            "type": "text",
                                            "text": messageObj[c]
                                        });
                                        k++;
                                        component_button.parameters = tempArr;
                                        objMsg.template.components.push(component_button);
                                        c++;
                                    }

                                }

                                if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "quick_reply",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    // console.log(tempArr);

                                    tempArr.push({
                                        "type": "payload",
                                        "payload": callToActionArr[i].quick_reply
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                                if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "copy_code",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    // console.log(tempArr);

                                    tempArr.push({
                                        "type": "coupon_code",
                                        "coupon_code": mid[j].offer_code_placeholder
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }

                                // }
                            }

                        }
                        objMsg.template.components.push(tmpHeader);
                    }
                    if (mid[j].placeholder_template_type == 2 || mid[j].placeholder_template_type == 3 || mid[j].placeholder_template_type == 0 || mid[j].placeholder_template_type == 4) {
                        let tmpHeader = {
                            "type": "header",
                            "parameters": [{
                                "type": "location",
                                "location": {
                                    "latitude": latitude,
                                    "longitude": longitude,
                                    "name": locationname,
                                    "address": locationaddress
                                }
                            }]
                        };

                        objMsg.template.components.push(tmpHeader);
                    }
                    if (mid[j].placeholder_template_type == 4 || mid[j].placeholder_template_type == 5) {
                        let tmpHeader = {
                            "type": "header",
                            "parameters": [{
                                "type": "location",
                                "location": {
                                    "latitude": latitude,
                                    "longitude": longitude,
                                    "name": locationname,
                                    "address": locationaddress
                                }
                            }]
                        };
                        if (mid[j].button_option_string != undefined && mid[j].button_option_string.length != 0) {
                            let k = 0;
                            let callToActionArr = JSON.parse(mid[j].button_option_string);
                            for (let i = 0; i < callToActionArr.length; i++) {
                                if (callToActionArr[i].call_phone != null && callToActionArr[i].call_phone != undefined) {
                                    let tempArr = [];
                                    tempArr.push({
                                        "type": "text",
                                        "text": callToActionArr[i].call_phone.phone_button_text
                                    });
                                }
                                if (callToActionArr[i].visit_website != null && callToActionArr[i].visit_website != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "url",
                                        //"index": i + 1,
                                        "index": i,
                                        "parameters": tempArr
                                    };

                                    if (callToActionArr[i].visit_website.web_url_option == 1) {

                                        let messageObj = JSON.parse(mid[j].dynamic_url_placeholder);
                                        tempArr.push({
                                            "type": "text",
                                            "text": messageObj[c]
                                        });
                                        k++;
                                        component_button.parameters = tempArr;
                                        objMsg.template.components.push(component_button);
                                        c++;
                                    }

                                }

                                if (callToActionArr[i].quick_reply != null && callToActionArr[i].quick_reply != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "quick_reply",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    // console.log(tempArr);

                                    tempArr.push({
                                        "type": "payload",
                                        "payload": callToActionArr[i].quick_reply
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                                if (callToActionArr[i].copy_offer_code != null && callToActionArr[i].copy_offer_code != undefined) {
                                    let tempArr = [];
                                    let component_button = {
                                        "type": "button",
                                        "sub_type": "copy_code",
                                        "index": i,
                                        "parameters": tempArr
                                    };
                                    // console.log(tempArr);

                                    tempArr.push({
                                        "type": "coupon_code",
                                        "coupon_code": mid[j].offer_code_placeholder
                                    });
                                    component_button.parameters = tempArr;
                                    objMsg.template.components.push(component_button);
                                }
                                // }
                            }

                        }
                        objMsg.template.components.push(tmpHeader);
                    }
                }
                break;
            case 6: //carousel
                let urlarr = [];
                let cards = [];
                let carddata = null;
                let parametermedia = null;
                let carousel_payloads111 = JSON.parse(mid[j].carousel_placeholder);
                let indexButton = carousel_payloads111.card1.index;
                let buttonctaIdx = null;
                let buttonqrIdx = null;
                for (let i = 0; i < indexButton.length; i++) {
                    if (Object.keys(indexButton[i]) == "visit_website") {
                        buttonctaIdx = i;
                    }
                    if (Object.keys(indexButton[i]) == "quick_reply") {
                        buttonqrIdx = i;
                    }
                }
                if (mid[j].mediaflag == 0) {
                    if (mid[j].placeholders != "" && Array.isArray(JSON.parse(mid[j].placeholders))) {
                        let tempArr = fetchPlaceholders(mid[j].placeholders);
                        bodyContent = mid[j].body_message.toString();
                        let carousel_payloads = JSON.parse(mid[j].carousel_placeholder);

                        Object.keys(carousel_payloads).forEach(function (key) {
                            let value = carousel_payloads[key];

                            urlarr.push(JSON.stringify(value));
                        });


                        for (let i = 0; i < urlarr.length; i++) {
                            let mediaurl1 = JSON.parse(urlarr[i]);
                            if (mediaurl1.media_url != undefined && mediaurl1.media_url) {
                                if (carousel_payloads111.card1.media_type == 1) {

                                    parametermedia = [
                                        {
                                            type: "image",
                                            image: {
                                                link: mediaurl1.media_url,
                                            },
                                        },
                                    ];
                                } else {
                                    parametermedia = [
                                        {
                                            type: "video",
                                            video: {
                                                link: mediaurl1.media_url,
                                            },
                                        },
                                    ];
                                }
                            }
                            if (mediaurl1.media_id != undefined && mediaurl1.media_id) {
                                if (carousel_payloads111.card1.media_type == 1) {

                                    parametermedia = [
                                        {
                                            type: "image",
                                            image: {
                                                id: mediaurl1.media_id,
                                            },
                                        },
                                    ];
                                } else {
                                    parametermedia = [
                                        {
                                            type: "video",
                                            video: {
                                                id: mediaurl1.media_id,
                                            },
                                        },
                                    ];
                                }
                            }

                            let dynamicPh = (mediaurl1.hasOwnProperty('dynamic_url')) ? [{ "type": "text", "text": mediaurl1.dynamic_url }] : ""; // mediaurl1.dynamic_url : "";
                            if (mediaurl1.body_placeholder != undefined && mediaurl1.body_placeholder.length > 0) {
                                let arr11 = fetchPlaceholders11(mediaurl1.body_placeholder);

                                carddata = {
                                    card_index: i,
                                    components: [
                                        {
                                            "type": "body",
                                            "parameters": arr11
                                        },
                                        {
                                            type: "header",
                                            parameters: parametermedia

                                        }, {
                                            "type": "BUTTON",
                                            "sub_type": "QUICK_REPLY",
                                            "index": buttonqrIdx,
                                            "parameters": [
                                                {
                                                    "type": "PAYLOAD",
                                                    "payload": `card${i + 1}`
                                                }
                                            ]
                                        },
                                        {
                                            "type": "BUTTON",
                                            "sub_type": "URL",
                                            "index": buttonctaIdx,
                                            "parameters": dynamicPh

                                        }

                                    ],
                                };
                            } else {

                                carddata = {
                                    card_index: i,
                                    components: [
                                        {
                                            type: "header",
                                            parameters: parametermedia

                                        }, {
                                            "type": "BUTTON",
                                            "sub_type": "QUICK_REPLY",
                                            "index": buttonqrIdx,
                                            "parameters": [
                                                {
                                                    "type": "PAYLOAD",
                                                    "payload": `card${i + 1}`
                                                }
                                            ]
                                        },
                                        {
                                            "type": "BUTTON",
                                            "sub_type": "URL",
                                            "index": buttonctaIdx,
                                            "parameters": dynamicPh
                                        }

                                    ],
                                };

                            }

                            cards.push(carddata);
                        }

                        objMsg = {
                            messaging_product: "whatsapp",
                            recipient_type: "individual",
                            to: mid[j].mobileno,
                            type: "template",
                            template: {
                                language: {
                                    code: mid[j].language,
                                },
                                name: mid[j].templatetitle,
                                components: [
                                    {
                                        type: "body",
                                        parameters: tempArr,
                                    },
                                    {
                                        type: "CAROUSEL",
                                        cards: cards,
                                    },
                                ],
                            },
                        };
                    } else {

                        bodyContent = mid[j].body_message.toString();
                        let carousel_payloads = JSON.parse(mid[j].carousel_placeholder);

                        Object.keys(carousel_payloads).forEach(function (key) {
                            let value = carousel_payloads[key];
                            urlarr.push(JSON.stringify(value));
                        });

                        for (let i = 0; i < urlarr.length; i++) {
                            let mediaurl1 = JSON.parse(urlarr[i]);
                            if (mediaurl1.media_url != undefined && mediaurl1.media_url) {
                                if (carousel_payloads111.card1.media_type == 1) {

                                    parametermedia = [
                                        {
                                            type: "image",
                                            image: {
                                                link: mediaurl1.media_url,
                                            },
                                        },
                                    ];
                                } else {
                                    parametermedia = [
                                        {
                                            type: "video",
                                            video: {
                                                link: mediaurl1.media_url,
                                            },
                                        },
                                    ];
                                }
                            }
                            if (mediaurl1.media_id != undefined && mediaurl1.media_id) {
                                if (carousel_payloads111.card1.media_type == 1) {

                                    parametermedia = [
                                        {
                                            type: "image",
                                            image: {
                                                id: mediaurl1.media_id,
                                            },
                                        },
                                    ];
                                } else {
                                    parametermedia = [
                                        {
                                            type: "video",
                                            video: {
                                                id: mediaurl1.media_id,
                                            },
                                        },
                                    ];
                                }
                            }

                            let dynamicPh = (mediaurl1.hasOwnProperty('dynamic_url')) ? [{ "type": "text", "text": mediaurl1.dynamic_url }] : ""; // mediaurl1.dynamic_url : "";
                            if (mediaurl1.body_placeholder != undefined && mediaurl1.body_placeholder.length > 0) {
                                let arr11 = fetchPlaceholders11(mediaurl1.body_placeholder);

                                carddata = {
                                    card_index: i,
                                    components: [
                                        {
                                            "type": "body",
                                            "parameters": arr11
                                        },
                                        {
                                            type: "header",
                                            parameters: parametermedia,
                                        }, {
                                            "type": "BUTTON",
                                            "sub_type": "QUICK_REPLY",
                                            "index": buttonqrIdx,
                                            "parameters": [
                                                {
                                                    "type": "PAYLOAD",
                                                    "payload": `card${i + 1}`
                                                }
                                            ]
                                        },
                                        {
                                            "type": "BUTTON",
                                            "sub_type": "URL",
                                            "index": buttonctaIdx,
                                            "parameters": dynamicPh

                                        }

                                    ],
                                };
                            } else {


                                carddata = {
                                    card_index: i,
                                    components: [

                                        {
                                            type: "header",
                                            parameters: parametermedia,
                                        }, {
                                            "type": "BUTTON",
                                            "sub_type": "QUICK_REPLY",
                                            "index": buttonqrIdx,
                                            "parameters": [
                                                {
                                                    "type": "PAYLOAD",
                                                    "payload": `card${i + 1}`
                                                }
                                            ]
                                        },
                                        {
                                            "type": "BUTTON",
                                            "sub_type": "URL",
                                            "index": buttonctaIdx,
                                            "parameters": dynamicPh
                                        }

                                    ],
                                };

                            }

                            cards.push(carddata);
                        }

                        objMsg = {
                            messaging_product: "whatsapp",
                            recipient_type: "individual",
                            to: mid[j].mobileno,
                            type: "template",
                            template: {
                                language: {
                                    code: mid[j].language,
                                },
                                name: mid[j].templatetitle,
                                components: [

                                    {
                                        type: "CAROUSEL",
                                        cards: cards,
                                    },
                                ],
                            },
                        };

                    }
                }

                break;
        }

        let tempobj = {
            objMsg: objMsg,
            bodyContent: bodyContent,
            mid: mid[j],
            TPS_Payload: TPS_Payload
        };

        // threadsqueue.add(tempobj).then((job) => {
        //     console.log('Added to Queue');
        //     console.log(' JOBS ======================>' + JSON.stringify(job.id));
        // });
        // }

        try {
            // Add job to the queue
            const job = await threadsqueue.add(tempobj);

            let query_1 = "DELETE FROM ezb_message_request_master where id = ?";
            console.log('query_1 ======================>' + query_1);
            let deleteid = await mysql.query(query_1, [mid[j].id]);
            console.log('Deleted id from Request Master ======================>' + JSON.stringify(deleteid));

            console.log('Added to Queue ======================>' + JSON.stringify(job.id));
        } catch (error) {
            // Handle errors that occur when adding the job
            query = "UPDATE ezb_message_request_master SET issentpicked = ? WHERE id = ?";
            let updateissentpicked = await mysql.query(query, [0, mid[j].id]);
            console.log('updateissentpicked ==========>' + JSON.stringify(updateissentpicked));

            console.error('Error adding job to queue:', error.message);
        }


        temid.push(mid[j].id);
        if (j == mid.length - 1) {
            // console.log('temid ==========>'(temid.length));
            // await redis.quit();
            return temid;
        }

    }
};
