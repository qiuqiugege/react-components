import Image from 'next/image';

import { useState, useEffect, useCallback, useRef } from 'react';

import { Input } from '@/components/index';

import classNames from 'classnames';

import styles from './style.module.scss';

import { ISelectLabel, StaticImport } from '../../interface/global';
import { useI18n, useStateCallback } from '@/hooks/index';

interface ISelectProps {
    icon?: string | StaticImport;
    classNames?: Object;
    listBoxClassNames?: Object;
    selectList: ISelectLabel[];
    defaultSelect?: ISelectLabel;
    defaultValue?: string;
    value?: string;
    key?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>, item?: ISelectLabel, index?: number) => void;
    // 选择框弹出的位置
    areaY?: 'top' | 'bottom';
    areaX?: 'left' | 'right';
    placeholder?: string;
    // 是否禁用
    disabled?: boolean;
    // 配置是否可搜索
    showSearch?: boolean;
}

/** 组件标识 */
Select.displayName = 'Select';

export function Select(props: ISelectProps): React.ReactElement {
    const { t } = useI18n('component');

    /** 存储上一次的value, 用于判断更改是否是父元素传入 */
    const prevValueRef = useRef<string | number>();

    // 搜索框 value showSearch 模式下用于展示的value
    const [searchValue, setSearchValue] = useState(() => {
        if (props.defaultSelect) {
            return props.defaultSelect.label;
        }
        if (props.defaultValue) {
            const findItem = props.selectList.find(item => item.value === props.defaultValue);
            if (!findItem) {
                console.warn(`The ${props.defaultValue} default value is invalid`);
                return '';
            }
            return findItem.label;
        }
        return '';
    });

    // 搜索结果 <selectList>
    const [searchList, setSearchList] = useState<ISelectLabel[]>([]);

    // 无结果数组
    const notData = { label: t('select.notData'), value: '' };

    // 上一次搜索选择的结果
    const [preSearchValue, setPreSearchValue] = useState(searchValue);

    // 控制select list显示隐藏
    const [listVisible, setListVisible] = useStateCallback(false);

    // 初始化默认选中值设置， 优先使用 defaultSelect 的值判断是否有 defaultValue,再匹配选中项;
    const [value, setValue] = useState(() => {
        if (props.defaultSelect) {
            return props.defaultSelect.value;
        }
        if (props.defaultValue) {
            if (!props.selectList.some(item => item.value === props.defaultValue)) {
                console.warn(`The ${props.defaultValue} default value is invalid`);
            }
            return props.defaultValue;
        }
        return undefined;
    });

    // 初始化默认选中项设置， 优先使用 defaultSelect 没传的话 判断是否有 defaultValue,再匹配选中项;
    const [selected, setSelected] = useState(() => {
        if (props.defaultSelect) {
            if (!props.selectList.some(item => item.value === props.defaultSelect?.value)) {
                console.warn(`The ${props.defaultValue} defaultSelect is invalid`);
            }
            return props.defaultSelect;
        }
        if (props.defaultValue) {
            return props.selectList.find(item => item.value === props.defaultValue);
        }
        return undefined;
    });

    /**  value 改变时保存当前值, 用于判断是否发生变化*/
    useEffect(() => {
        prevValueRef.current = value;
    }, [value]);

    /** 判断传入的value 跟当前value是否一致, 不一致则使用传入的value */
    useEffect(() => {
        if (props.value && props.value !== prevValueRef.current) {
            setValue(props.value);

            setSelected(props.selectList.find(item => item.value === props.value));
        }
    }, [props.value]);

    // 点击下拉框以外区域关闭下拉框
    useEffect(() => {
        const selectHide = (e: MouseEvent) => {
            setSearchValue('');
            setListVisible(false, state => {
                /** 兼容动画时间 200ms */
                setTimeout(() => {
                    setSearchValue('');
                    setSearchList([]);
                }, 200);
            });
        };
        document.body.addEventListener('click', selectHide, false);
        return () => {
            document.body.removeEventListener('click', selectHide);
        };
    }, []);

    // select change handle
    const onSelectHandle = (select: ISelectLabel, e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.nativeEvent.stopPropagation();

        // notData
        if (select.value === '') return;

        setListVisible(false, state => {
            /** 兼容动画时间 200ms */
            setTimeout(() => {
                setSearchList([]);
            }, 200);
        });

        setSearchValue('');
        setPreSearchValue(select.label);

        setValue(select.value);
        setSelected(select);

        // setSearchValue('');
        // 模拟原生input事件载体方便form组件统一管理
        props.onChange &&
            props.onChange(
                {
                    target: {
                        value: select.value,
                    },
                } as React.ChangeEvent<HTMLSelectElement>,
                select
            );
    };

    /**
     * 搜索框搜索处理
     * @param e
     */
    const searchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 英文大小写支持模糊匹配
        const valueLow = value.toLocaleLowerCase().replace(/\s/g, '');

        const filterArea: ISelectLabel[] = [];
        selectList.forEach(item => {
            if (item.label.toLocaleLowerCase().indexOf(valueLow) !== -1) {
                filterArea.push({
                    label: item.label,
                    value: item.value,
                });
            }
        });

        // this.$nextTick(() => {
        //     document.getElementsByClassName('el-select-dropdown__wrap')[0].scrollTop = 0;
        // });

        filterArea.length === 0 && filterArea.push(notData);
        setSearchValue(value);
        setSearchList(filterArea);
    };

    /**
     * 展示下拉框
     * @param e
     */
    const openSelectListModal = (e: React.MouseEvent<HTMLDivElement>) => {
        e.nativeEvent.stopImmediatePropagation();
        setListVisible(!listVisible);
    };

    /**
     * 搜索模式,input focus处理
     */
    const inputFocusHandle = (e: React.FocusEvent<HTMLInputElement>) => {
        setSearchValue('');
        setListVisible(true);
    };

    const { icon, placeholder, listBoxClassNames, selectList, showSearch, disabled } = props;

    /**
     * 下拉列表显示逻辑
     * 有搜索内容展示搜索列表, 包含空状态
     * 无搜索内容展示传入的下拉列表
     */

    const showList = searchList.length > 0 ? searchList : selectList;

    // console.log(listVisible);
    return (
        <div
            className={classNames({
                [styles.root]: true,
                [styles.bottom]: props.areaY === 'bottom',
                ...props.classNames,
            })}>
            {/*  搜索模式 */}
            {showSearch ? (
                <div
                    className={classNames({
                        'select-label': true,
                        'select-disable': disabled,
                    })}>
                    <div className="label-lt">{icon && <Image src={icon} width={17} height={17}></Image>}</div>

                    <Input
                        value={searchValue}
                        classNames={{ 'label-value': true, 'input-placeholder': !!preSearchValue }}
                        onFocus={e => inputFocusHandle(e)}
                        onChange={e => searchInputChange(e)}
                        placeholder={preSearchValue || placeholder || t('select.defaultText')}
                        disabled={disabled}
                    />

                    <div
                        className={classNames({
                            'label-rt': true,
                            'point-top': listVisible,
                        })}>
                        <Image
                            src={'https://storage.googleapis.com/kvb/landing/icon/triangle.svg'}
                            width={10}
                            height={20}
                            layout="intrinsic"
                            unoptimized></Image>
                    </div>
                </div>
            ) : (
                <div
                    className={classNames({
                        'select-label': true,
                        'select-disable': disabled,
                    })}
                    onClick={e => openSelectListModal(e)}>
                    <div className="label-lt">{icon && <Image src={icon} width={17} height={17}></Image>}</div>
                    <div className="label-value">
                        {selected ? selected.label : placeholder || t('select.defaultText')}
                    </div>
                    <div
                        className={classNames({
                            'label-rt': true,
                            'point-top': listVisible,
                        })}>
                        <Image
                            src={'https://storage.googleapis.com/kvb/landing/icon/triangle.svg'}
                            width={10}
                            height={20}
                            layout="intrinsic"
                            unoptimized></Image>
                    </div>
                </div>
            )}

            <div
                className={classNames({
                    ...listBoxClassNames,
                    'list-box': true,
                    'box-visible': listVisible,
                })}>
                {showList.map(item => {
                    return (
                        <div
                            key={item.label}
                            className={classNames({
                                'list-item': true,
                                'language-active': item.value === selected?.value,
                            })}
                            onClick={e => onSelectHandle(item, e)}>
                            {item.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
