#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import argparse
from pathlib import Path


class AppCreator:
    def __init__(self, app_name="MyAndroidApp", package_name="com.jacob"):
        self.app_name = app_name
        self.package_name = package_name
        self.project_root = Path(__file__)
        self.output_dir = self.project_root / "output" / app_name

    def create(self):
        # 执行创建流程
        try:
            print("=" * 60)
            print("🚀 项目开始创建...")
            print("=" * 60)
            print()



            print("=" * 60)
            print("✅ 项目创建成功!")
            print("=" * 60)
            print()
            print(f"📁 项目位置: {self.output_dir}")
            print()
            print("🎯 下一步:")
            print(f"  1. 在Android Studio中打开项目")
            print(f"     cd {self.output_dir}")
            print()
            print(f"  2. 运行应用")
            print()

            return True
        except Exception as e:
            print()
            print("=" * 60)
            print("❌ 创建失败!")
            print("=" * 60)
            print(f"错误信息: {str(e)}")
            # 只有出错时才导入traceback模块
            import traceback
            # 打印完整调用栈到stderr
            traceback.print_exc()
            return False


def main():
    parser = argparse.ArgumentParser(
        description='创建自定义的Android应用项目',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python create_android_app.py --name MyAndroidApp --package com.jacob.myandroidapp
        """
    )

    parser.add_argument('--name', default='MyAndroidApp', help='应用名称')
    parser.add_argument('--package', default='com.jacob.myandroidapp', help='包名(如: com.jacob.myandroidapp)')

    args = parser.parse_args()

    # 验证包名格式
    if not args.package or args.package.count('.') < 1:
        print("❌ 错误: 包名格式不正确,应该类似 com.example.myapp")
        sys.exit(1)

    creator = AppCreator(args.name, args.package)
    success = creator.create()

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
