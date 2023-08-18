import Form, { useForm } from './';
import { Select, Input, InputCode, Button, Radio, Checkbox } from '../index';

import styles from './style.module.scss';

const usernameRules = [{ required: true, type: 'email', message: '请输入电子邮箱' }];
const passworRules = [{ required: true, type: 'password', message: '请输入密码' }];
const languageRules = { required: true, type: 'language', message: '请选择语言' };
const codeRules = [{ required: true, type: 'code', message: '请输入验证码' }];

interface IFormData {
    username: string;
    code?: string;
    password?: string;
    language?: string;
}

/**
 * 表单  基本功能 参考案例
 * @returns
 */
export const FormExample = () => {
    const [form] = useForm<IFormData>();
    const formData = form.getFieldsValue();
    return (
        <Form
            onFinish={values => {
                console.log('Success', values);
            }}
            onFinishFailed={err => {
                console.log('Failed', err);
            }}
            onFieldsChange={(field: string[], fields: string[]) => {
                console.log(field, fields);
            }}
            onValuesChange={(value, values) => {
                console.log(value, values);
            }}
            form={form}>
            <Form.Item name={'language'} key="language" label={'语言'} rules={[languageRules]}>
                <Select
                    areaY="bottom"
                    selectList={[
                        { label: '中文简体', value: 'zh-CN' },
                        { label: '英文', value: 'en-US' },
                    ]}
                />
            </Form.Item>

            <Form.Item
                key={'username'}
                name={'username'}
                label={'电子邮箱'}
                rules={usernameRules}
                dependencies={['language']}
                hide={formData.language !== 'en-US'}>
                <Input />
            </Form.Item>

            <Form.Item name={'password'} key={'password'} label={'密码'} rules={passworRules}>
                <Input type="password" />
            </Form.Item>

            <Form.Item
                name={'confirm'}
                key={'confirm'}
                label={'确认密码'}
                rules={[
                    {
                        required: true,
                        type: 'password',
                        message: '请输入密码',
                    },
                    {
                        required: true,
                        type: 'password',
                        message: '两次输入密码不一致',
                        validator: (rule, value) => {
                            console.log(form.getFieldValue('password'));
                            if (form.getFieldValue('password') === value) {
                                return true;
                            }
                            return false;
                        },
                    },
                ]}
                dependencies={['password']}>
                <Input type="password" />
            </Form.Item>

            <Form.Item
                name={'count'}
                label={'选择'}
                rules={[
                    {
                        required: true,
                        message: '请选择一个啊！！',
                    },
                ]}>
                <Radio.Group>
                    <Radio value="1">11111</Radio>
                    <Radio value="2">22222</Radio>
                    <Radio value="3">33333</Radio>
                </Radio.Group>
            </Form.Item>

            <Form.Item name="checkbox" label="规则" rules={[{ required: false, message: '请选择规则' }]}>
                <Checkbox.Group>
                    <Checkbox value="all">全选</Checkbox>
                    <Checkbox value="1">111</Checkbox>
                    <Checkbox value="2">222</Checkbox>
                    <Checkbox value="3">222</Checkbox>
                </Checkbox.Group>
            </Form.Item>

            <Form.Item name={'code'} key={'code'} label={'验证码'} rules={codeRules} dependencies={['username']}>
                <InputCode authType={0} email={formData.username} />
            </Form.Item>

            <Button classNames={{ [styles.exampleSubmitBtn]: true }}>登录</Button>

            {/* <Form.Button
                classNames={{ [styles.loginBtn]: true }}
                loading={submitBtnLoading}
                form={form}
                watchName={['username', 'code', 'password']}>
                {t('login.submitText')}
            </Form.Button> */}
        </Form>
    );
};
