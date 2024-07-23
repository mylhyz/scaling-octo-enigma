#!/usr/bin/env python3

import os

def extract_desc_from_readme(readme_path):
    """从README文件中提取desc文本行"""
    desc_lines = []
    try:
        with open(readme_path, 'r', encoding='utf-8') as file:
            for line in file:
                if line.startswith('desc'):
                    desc_lines.append(line[5:].strip())
    except FileNotFoundError:
        print(f"文件 {readme_path} 未找到。")
    except Exception as e:
        print(f"读取文件时发生错误: {e}")
    return desc_lines

def main():
    current_directory = os.getcwd()
    readme_content = ["# scaling-octo-enigma","\n\n","小工具合集","\n\n"]
    
    # 遍历当前目录下的文件夹
    for item in os.listdir(current_directory):
        folder_path = os.path.join(current_directory, item)
        if os.path.isdir(folder_path):  # 确保是文件夹
            readme_path = os.path.join(folder_path, 'README.md')
            if os.path.exists(readme_path):  # 检查README文件是否存在
                desc_lines = extract_desc_from_readme(readme_path)
                if desc_lines:
                    readme_content.append(f"- {item} : " + "\n".join(desc_lines) + "\n")

    # 将提取的信息写入当前目录下的README文件
    output_path = os.path.join(current_directory, 'README.md')
    with open(output_path, 'w', encoding='utf-8') as file:
        file.writelines(readme_content)

    print(f"汇总信息已写入 {output_path}")

if __name__ == "__main__":
    main()