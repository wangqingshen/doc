<?php
namespace Yanshi\Controller;
use Think\Controller;

class IndexController extends Controller {
    private $_wechat_obj;
    public function _initialize() {
        Vendor('Wechat');
        $this->_wechat_obj = new \Wechat();
    }

    public function index(){


        $this->_wechat_obj->get_wechat_code();
        exit;

        $this->display();
    }

    /**
     * 微信鉴权
     */
    public function wechat_auth(){
        $wechat_code = I('code');
        $openid = $this->_wechat_obj->get_wechat_openid($wechat_code);
        //判断用户openid是否存在
        $member_model = D('Member');
        $condition = array(
            'wechat_openid' => $openid
        );
        $count = $member_model->count_member($condition,$msg);
        if(count == 0){
            //进入注册页面
            $this->display('index');
        }elseif (count == 1){
            //进入项目首页
            $this->display('index');
        }
    }

}
