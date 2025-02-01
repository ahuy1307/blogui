import React from "react";
import {
  DatePicker as AntdDatePicker,
  DatePickerProps,
  ConfigProvider,
} from "antd";

interface IDatePicker extends DatePickerProps { }

const DatePicker: React.FC<IDatePicker> = ({ ...rest }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          DatePicker: {
            colorPrimary: "var(--background-blue-default)",
            colorTextPlaceholder: "var(--text-color-placeholder)",
            colorText: "var(--text-color-primary)",
            colorBorder: "var(--border-color-default)",
            colorPrimaryHover: "var(--border-color-hover)",
            colorBgContainerDisabled: "var(--border-color-disable)"
          },
        },
      }}
    >
      <AntdDatePicker {...rest} />
    </ConfigProvider>
  );
};

export default DatePicker;
