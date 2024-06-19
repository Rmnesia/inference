import json
from pathlib import Path

class DatasetReader:
    def __init__(self, data_directory="./xinference/factory/data/"):
        self.data_directory = data_directory
        self.data_path = data_directory+"dataset_info.json"

    def transform_data(self, entry):
        dataset_name = entry[0]

        dataset_type = "qa"
        columns = entry[1].get("columns")
        if columns:
            if columns.get("prompt") == "text":
                dataset_type = "text"

        # 初始化标签列表
        tags = []
        if entry[1].get("subset"):
            tags.append(entry[1]["subset"])
        # 检查是否有其他条件需要添加到tags
        if entry[1].get("formatting"):
            tags.append(entry[1]["formatting"])

        # 构建输出数据结构
        transformed_entry = {
            "dataset_name": dataset_name,
            "dataset_type": dataset_type,
            "dataset_desc": "这是一个数据集" if "description" not in entry[1] else entry[1].get(
                "description", "这是一个数据集"),
            "dataset_tags": tags
        }

        return transformed_entry

    async def list_dataset(self) -> dict:
        """异步读取并返回dataset_info.json中的数据"""
        try:
            with open(self.data_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                transformed_data = []
                for entry in data.items():
                    transformed_entry = self.transform_data(entry)
                    transformed_data.append(transformed_entry)
                # 输出转换后的JSON
                output_json = json.dumps(transformed_data, ensure_ascii=False, indent=2)
            return output_json
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {self.data_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to decode JSON: {e}")

    async def create_dataset(self, dataset_name: str, dataset_type: str, dataset_desc: str, dataset_tags):
        """异步读取并导入dataset_info.json"""
        import datetime
        try:
            with open(self.data_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                # 检查新键是否已存在，如果存在则抛出异常
                if dataset_name in data:
                    raise KeyError(f"键 '{dataset_name}' 已经存在于字典中。")

                timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
                # 拼接文件名
                file_name = f"{dataset_name}{timestamp}.json"
                # 确保当前目录存在，然后写入JSON数据到文件
                with open(self.data_directory+file_name, 'w') as json_file:
                    json.dump([], json_file, ensure_ascii=False, indent=4)

                # 将新键值对添加到已有数据中
                data[dataset_name] = {
                    "file_name": file_name,
                    "description": dataset_desc
                }

                if dataset_type == 'text':
                    data[dataset_name]["columns"] = {}
                    data[dataset_name]["columns"]["prompt"] = "text"

                common_languages = ["zh", "en", "es", "fr", "de", "it", "pt", "ru", "ja", "ar"]
                for tag in dataset_tags:
                    if tag in common_languages:
                        data[dataset_name]['subset'] = tag
            with open(self.data_path, 'w+', encoding='utf-8') as file:
                # 将更新后的内容写回原JSON文件
                json.dump(data, file, ensure_ascii=False, indent=4)

        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {self.data_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to decode JSON: {e}")

    async def delete_dataset(self, dataset_name: str):
        """异步读取并删除dataset_info.json"""
        import os
        try:
            with open(self.data_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                # 检查新键是否已存在，如果存在则抛出异常
                if dataset_name in data:
                    file_name = data[dataset_name]['file_name']
                    del data[dataset_name]
                else:
                    raise KeyError(f"键 '{dataset_name}' 不存在于字典中。")
                os.remove(self.data_directory+file_name)

            with open(self.data_path, 'w+', encoding='utf-8') as file:
                # 将更新后的内容写回原JSON文件
                json.dump(data, file, ensure_ascii=False, indent=4)

        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {self.data_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to decode JSON: {e}")

    async def add_data(self, dataset_name: str, data_list):
        """异步读取dataset_info.json并添加一条数据"""
        try:
            with open(self.data_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                # 检查新键是否已存在，如果存在则抛出异常
                if dataset_name in data:
                    file_name = self.data_directory + data[dataset_name]['file_name']
                else:
                    raise KeyError(f"键 '{dataset_name}' 不存在于字典中。")

            with open(file_name, 'r', encoding='utf-8') as file:
                # 将更新后的内容写回原JSON文件
                data = json.load(file)
                for item in data_list:
                    data.append(item)
            with open(file_name, 'w+', encoding='utf-8') as file:
                json.dump(data, file, ensure_ascii=False, indent=4)

        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {self.data_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to decode JSON: {e}")

    async def read_data(self, dataset_name: str, page_num: int, page_size: int, keyword: str = None) -> dict:
        """异步读取dataset_info.json并读取数据"""
        try:
            with open(self.data_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                # 检查新键是否已存在，如果存在则抛出异常
                if dataset_name in data:
                    file_name = self.data_directory + data[dataset_name]['file_name']
                else:
                    raise KeyError(f"键 '{dataset_name}' 不存在于字典中。")

            with open(file_name, 'r', encoding='utf-8') as file:
                raw_data = json.load(file)
                if keyword:
                    # 对于每个数据项，检查所有字段值是否包含过滤关键词（忽略大小写）
                    filtered_data = [item for item in raw_data if
                                     any(keyword.lower() in str(value).lower() for value in item.values())]
                else:
                    filtered_data = raw_data
                return {
                    "total":len(filtered_data),
                    "data_list":filtered_data[(page_num-1)*page_size:page_num*page_size]
                }

        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {self.data_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to decode JSON: {e}")

