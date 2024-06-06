import json
from pathlib import Path

class DatasetReader:
    def __init__(self, data_path="./xinference/factory/data/dataset_info.json"):
        self.data_path = data_path

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
            with open(self.data_path, 'r') as file:
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




